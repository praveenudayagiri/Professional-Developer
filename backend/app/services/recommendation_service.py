import os
import time
import logging
from typing import List, Dict, Any, Optional
import uuid

from app.models import EducatorProfile, PDResource, RecommendationResponse, ActionStep, RecommendationLog
from app.database import get_database, get_sync_database
from app.services.vector_store import VectorStore
from app.services.groq_service import GroqService

logger = logging.getLogger(__name__)

class RecommendationService:
    """Main service for generating personalized PD recommendations"""
    
    def __init__(self):
        self.vector_store = None
        self.groq_service = None
        self.initialized = False
        
    async def initialize(self):
        """Initialize the recommendation service"""
        try:
            logger.info("Initializing recommendation service...")
            
            # Get API key
            groq_api_key = os.getenv("GROQ_API_KEY")
            if not groq_api_key:
                raise ValueError("GROQ_API_KEY environment variable is required")
            
            # Initialize services
            self.vector_store = VectorStore()
            self.groq_service = GroqService(api_key=groq_api_key)
            
            # Load or build vector store
            await self._initialize_vector_store()
            
            self.initialized = True
            logger.info("Recommendation service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize recommendation service: {e}")
            raise
    
    async def generate_recommendations(
        self, 
        educator_profile: EducatorProfile,
        max_resources: int = 5
    ) -> RecommendationResponse:
        """Generate personalized recommendations for an educator"""
        
        if not self.initialized:
            raise RuntimeError("Recommendation service not initialized")
        
        start_time = time.time()
        session_id = str(uuid.uuid4())
        
        try:
            logger.info(f"Generating recommendations for session {session_id}")
            
            # Step 1: Create search query from educator profile
            search_query = self._create_search_query(educator_profile)
            logger.debug(f"Search query: {search_query}")
            
            # Step 2: Retrieve matching resources from vector store
            search_filters = self._create_search_filters(educator_profile)
            retrieved_resources = self.vector_store.search(
                query=search_query,
                k=max_resources * 2,  # Get more candidates for filtering
                filters=search_filters
            )
            
            # Step 3: Filter and rank resources based on constraints
            filtered_resources = self._filter_by_constraints(
                retrieved_resources, 
                educator_profile, 
                max_resources
            )
            
            # Step 4: Generate coaching response using Groq
            # Get matching resources using the resource service
            from app.services.resource_service import resource_service
            search_query = self._create_search_query(educator_profile)
            search_filters = self._create_search_filters(educator_profile)
            
            logger.info(f"Search query: '{search_query}'")
            logger.info(f"Search filters: {search_filters}")
            
            resource_objects = await resource_service.search_resources(
                query=search_query,
                filters=search_filters,
                limit=max_resources
            )
            
            logger.info(f"Found {len(resource_objects)} resources from search")
            
            coaching_response = await self.groq_service.generate_coaching_response(
                educator_profile, 
                resource_objects
            )
            
            # Step 5: Create final recommendation response
            response = RecommendationResponse(
                coach_message=coaching_response["coach_message"],
                action_steps=coaching_response["action_steps"],
                recommended_resources=resource_objects,
                confidence_score=0.85  # Default confidence score
            )
            
            # Step 6: Log the recommendation session
            processing_time = int((time.time() - start_time) * 1000)
            await self._log_recommendation_session(
                session_id, educator_profile, resource_objects, 
                response, processing_time
            )
            
            logger.info(f"Generated {len(resource_objects)} recommendations in {processing_time}ms")
            return response
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            raise
    
    def _create_search_query(self, educator_profile: EducatorProfile) -> str:
        """Create a search query from educator profile"""
        query_parts = []
        
        # Add subjects
        if educator_profile.subjects:
            query_parts.extend(educator_profile.subjects)
        
        # Add grade levels
        if educator_profile.grade_levels:
            query_parts.extend(educator_profile.grade_levels)
        
        # Add teaching goals (most important)
        if educator_profile.teaching_goals:
            query_parts.extend(educator_profile.teaching_goals)
        
        # Add experience level context
        if educator_profile.experience_level:
            query_parts.append(f"{educator_profile.experience_level} level")
        
        # Add preferred formats if specified
        if educator_profile.preferred_format:
            query_parts.extend(educator_profile.preferred_format)
        
        return " ".join(query_parts)
    
    def _create_search_filters(self, educator_profile: EducatorProfile) -> Dict[str, Any]:
        """Create search filters based on educator constraints"""
        filters = {}
        
        # Filter by subjects if specified
        if educator_profile.subjects:
            filters["subjects"] = educator_profile.subjects
        
        # Filter by grade levels if specified  
        if educator_profile.grade_levels:
            filters["grade_levels"] = educator_profile.grade_levels
        
        # Filter by available time
        if educator_profile.available_time_per_week:
            # Assume they want resources that take at most 50% of their available time
            max_duration = educator_profile.available_time_per_week * 0.5
            filters["max_duration"] = max_duration
        
        # Filter by preferred format
        if educator_profile.preferred_format:
            filters["format"] = educator_profile.preferred_format
        
        return filters
    
    def _filter_by_constraints(
        self, 
        retrieved_resources: List[Dict[str, Any]], 
        educator_profile: EducatorProfile,
        max_resources: int
    ) -> List[tuple]:
        """Filter and rank resources based on educator constraints"""
        
        filtered = []
        
        for resource_dict in retrieved_resources:
            # Extract similarity score from the resource dict
            score = resource_dict.get('similarity_score', 0.0)
            # Remove similarity_score from resource dict to get clean resource
            resource = {k: v for k, v in resource_dict.items() if k != 'similarity_score'}
            # Budget constraint filtering
            if educator_profile.budget_constraint:
                if educator_profile.budget_constraint == "low" and resource.get('cost') not in ["free", "low"]:
                    continue
                elif educator_profile.budget_constraint == "medium" and resource.get('cost') == "high":
                    continue
            
            # Experience level matching
            if educator_profile.experience_level:
                if (educator_profile.experience_level == "beginner" and 
                    resource.get('level') == "advanced"):
                    score *= 0.7  # Reduce score for advanced resources for beginners
                elif (educator_profile.experience_level == "advanced" and 
                      resource.get('level') == "beginner"):
                    score *= 0.8  # Slightly reduce score for basic resources for advanced users
            
            # Preferred format boost
            if (educator_profile.preferred_format and 
                resource.get('format') in educator_profile.preferred_format):
                score *= 1.2  # Boost score for preferred formats
            
            filtered.append((resource, score))
        
        # Sort by score (descending) and return top results
        filtered.sort(key=lambda x: x[1], reverse=True)
        return filtered[:max_resources]
    
    def _calculate_confidence_score(self, resource_objects: List) -> float:
        """Calculate confidence score based on resource matches"""
        if not resource_objects:
            return 0.0
        
        # For now, return a default confidence score
        # In the future, this could be based on vector similarity scores
        return 0.85
    
    async def _log_recommendation_session(
        self,
        session_id: str,
        educator_profile: EducatorProfile,
        resource_objects: List,
        response: RecommendationResponse,
        processing_time_ms: int
    ):
        """Log the recommendation session to database"""
        try:
            db = await get_database()
            logs_collection = db.recommendation_logs
            
            log_entry = RecommendationLog(
                session_id=session_id,
                educator_profile=educator_profile.dict(),
                retrieved_resources=[resource.title if hasattr(resource, 'title') else str(resource) for resource in resource_objects],
                final_recommendations=[resource.title if hasattr(resource, 'title') else str(resource) for resource in response.recommended_resources],
                coach_message=response.coach_message,
                action_steps=response.action_steps,
                processing_time_ms=processing_time_ms
            )
            
            await logs_collection.insert_one(log_entry.dict())
            logger.debug(f"Logged recommendation session {session_id}")
            
        except Exception as e:
            logger.error(f"Failed to log recommendation session: {e}")
            # Don't raise - logging failure shouldn't break the main flow
    
    async def _initialize_vector_store(self):
        """Initialize the vector store with existing resources"""
        try:
            # Try to load existing vector store
            vector_store_path = "data/vector_store"
            self.vector_store.load_index(vector_store_path)  # Remove await - this is synchronous
            
            # If no existing store or empty, rebuild from database
            if self.vector_store.index is None or self.vector_store.index.ntotal == 0:
                logger.info("No existing vector store found, building from database...")
                await self._seed_sample_resources()  # Ensure we have sample data
                await self.vector_store.rebuild_from_database()
                
                # Save the newly built index
                os.makedirs("data", exist_ok=True)
                self.vector_store.save_index(vector_store_path)
            
            logger.info(f"Vector store ready with {self.vector_store.index.ntotal if self.vector_store.index else 0} resources")
            
        except Exception as e:
            logger.error(f"Error initializing vector store: {e}")
            # Create empty vector store as fallback
            logger.warning("Creating empty vector store as fallback")
    
    async def _seed_sample_resources(self):
        """Seed the database with sample PD resources if empty"""
        try:
            db = get_sync_database()
            resources_collection = db.resources
            
            # Check if we already have resources
            if resources_collection.count_documents({}) > 0:
                logger.info("Database already contains resources")
                return
            
            logger.info("Seeding database with sample PD resources...")
            
            sample_resources = [
                {
                    "title": "Active Learning Strategies for Large Classes",
                    "description": "Learn practical techniques to engage students in large classroom settings through interactive activities, group work, and technology integration.",
                    "resource_type": "workshop",
                    "tags": ["engagement", "active learning", "large classes", "interaction"],
                    "duration_minutes": 90,
                    "level": "intermediate",
                    "format": "online",
                    "link": "https://www.edutopia.org/article/active-learning-strategies-large-classes",
                    "cost": "free",
                    "subjects": ["Math", "Science", "English", "Social Studies"],
                    "grade_levels": ["Middle School", "High School"]
                },
                {
                    "title": "QuizMaster - Interactive Quiz Platform",
                    "description": "Create engaging real-time quizzes and polls to assess student understanding and increase participation in any subject area.",
                    "resource_type": "tool",
                    "tags": ["assessment", "engagement", "technology", "real-time"],
                    "duration_minutes": 30,
                    "level": "beginner",
                    "format": "self_paced",
                    "link": "https://kahoot.com/schools/",
                    "cost": "low",
                    "subjects": ["Math", "Science", "English", "Social Studies", "History"],
                    "grade_levels": ["Elementary", "Middle School", "High School"]
                },
                {
                    "title": "Backward Design for Curriculum Planning",
                    "description": "Master the art of backward design to create more effective lesson plans and assessments that align with learning objectives.",
                    "resource_type": "article",
                    "tags": ["curriculum", "planning", "assessment", "objectives"],
                    "duration_minutes": 45,
                    "level": "intermediate",
                    "format": "self_paced",
                    "link": "https://www.understood.org/en/school-learning/for-educators/teaching-techniques/backward-design-curriculum-planning",
                    "cost": "free",
                    "subjects": ["Math", "Science", "English", "Social Studies", "Art"],
                    "grade_levels": ["Elementary", "Middle School", "High School"]
                },
                {
                    "title": "Formative Assessment Techniques Workshop",
                    "description": "Discover quick and effective formative assessment strategies to monitor student progress and adjust instruction in real-time.",
                    "resource_type": "workshop",
                    "tags": ["assessment", "formative", "monitoring", "feedback"],
                    "duration_minutes": 120,
                    "level": "beginner",
                    "format": "hybrid",
                    "link": "https://www.edutopia.org/assessment-guide-importance",
                    "cost": "medium",
                    "subjects": ["Math", "Science", "English"],
                    "grade_levels": ["Elementary", "Middle School"]
                },
                {
                    "title": "Digital Whiteboard Tools for Remote Learning",
                    "description": "Explore various digital whiteboard platforms and learn how to use them effectively for remote and hybrid teaching environments.",
                    "resource_type": "tool",
                    "tags": ["technology", "remote learning", "collaboration", "digital tools"],
                    "duration_minutes": 60,
                    "level": "beginner",
                    "format": "online",
                    "link": "https://jamboard.google.com/",
                    "cost": "free",
                    "subjects": ["Math", "Science", "Art"],
                    "grade_levels": ["Elementary", "Middle School", "High School"]
                }
            ]
            
            # Insert sample resources
            resources_collection.insert_many(sample_resources)
            logger.info(f"Successfully seeded {len(sample_resources)} sample resources")
            
        except Exception as e:
            logger.error(f"Error seeding sample resources: {e}")
            raise