import logging
from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.connection import get_database
from app.models.resource import PDResource, ResourceCreate, ResourceType, ResourceLevel, ResourceFormat
from app.services.vector_store import VectorStore
import asyncio

logger = logging.getLogger(__name__)

class ResourceService:
    """Service for managing professional development resources"""
    
    def __init__(self):
        self.vector_store = VectorStore()
        
    async def get_database(self) -> AsyncIOMotorDatabase:
        """Get database connection"""
        return await get_database()
    
    async def create_resource(self, resource_data: ResourceCreate) -> PDResource:
        """Create a new resource"""
        try:
            db = await self.get_database()
            collection = db.resources
            
            # Convert to dict and add timestamps
            resource_dict = resource_data.dict()
            
            # Insert into database
            result = await collection.insert_one(resource_dict)
            
            # Retrieve the created resource
            created_resource = await collection.find_one({"_id": result.inserted_id})
            created_resource["_id"] = str(created_resource["_id"])
            
            # Add to vector store for search
            await self.vector_store.add_documents([created_resource])
            
            logger.info(f"Created resource: {resource_data.title}")
            return PDResource(**created_resource)
            
        except Exception as e:
            logger.error(f"Error creating resource: {e}")
            raise
    
    async def get_resources(
        self, 
        resource_type: Optional[str] = None,
        subject: Optional[str] = None,
        grade_level: Optional[str] = None,
        level: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get resources with optional filtering"""
        try:
            db = await self.get_database()
            collection = db.resources
            
            # Build filter query
            filter_query = {}
            
            if resource_type:
                filter_query["resource_type"] = resource_type
            if subject:
                filter_query["subjects"] = {"$in": [subject]}
            if grade_level:
                filter_query["grade_levels"] = {"$in": [grade_level]}
            if level:
                filter_query["level"] = level
            
            # Execute query
            cursor = collection.find(filter_query).limit(limit)
            resources = await cursor.to_list(length=limit)
            
            # Convert ObjectId to string
            for resource in resources:
                resource["_id"] = str(resource["_id"])
            
            logger.info(f"Retrieved {len(resources)} resources")
            return resources
            
        except Exception as e:
            logger.error(f"Error retrieving resources: {e}")
            raise
    
    async def search_resources(self, query: str, filters: dict = None, limit: int = 5) -> List[PDResource]:
        """Search for resources using vector similarity and fallback filtering"""
        try:
            # Try vector search first
            if hasattr(self.vector_store, 'search'):
                results = self.vector_store.search(query, k=limit, filters=filters)
                if results:
                    # Convert to PDResource objects
                    resources = []
                    for result in results:
                        try:
                            # Remove similarity_score before creating PDResource
                            resource_data = result.copy()
                            resource_data.pop('similarity_score', None)
                            resource_data.pop('_id', None)  # Remove MongoDB _id
                            resource = PDResource(**resource_data)
                            resources.append(resource)
                        except Exception as e:
                            logger.warning(f"Error creating PDResource from result: {e}")
                            continue
                    return resources
            
            # Fallback to database search
            logger.info("Using fallback database search")
            return await self._fallback_search(query, filters, limit)
            
        except Exception as e:
            logger.error(f"Error searching resources: {e}")
            # Return fallback search results
            return await self._fallback_search(query, filters, limit)
    
    def _create_search_query(self, educator_profile: Dict[str, Any]) -> str:
        """Create search query from educator profile"""
        query_parts = []
        
        # Add subjects
        if educator_profile.get("subjects"):
            query_parts.extend(educator_profile["subjects"])
        
        # Add grade levels
        if educator_profile.get("grade_levels"):
            query_parts.extend([f"grade {level}" for level in educator_profile["grade_levels"]])
        
        # Add teaching goals
        if educator_profile.get("teaching_goals"):
            query_parts.extend(educator_profile["teaching_goals"])
        
        # Add experience level
        if educator_profile.get("experience_level"):
            query_parts.append(educator_profile["experience_level"])
        
        return " ".join(query_parts)
    
    async def _fallback_search(self, query: str, filters: dict = None, limit: int = 5) -> List[PDResource]:
        """Fallback search when vector search fails"""
        try:
            db = await self.get_database()
            collection = db.resources
            
            # Build basic filter
            filter_query = {}
            
            # Add text search if query provided
            if query:
                # Split query into individual terms for more flexible matching
                query_terms = query.split()
                text_conditions = []
                
                for term in query_terms:
                    text_conditions.extend([
                        {"title": {"$regex": term, "$options": "i"}},
                        {"description": {"$regex": term, "$options": "i"}},
                        {"tags": {"$regex": term, "$options": "i"}}
                    ])
                
                if text_conditions:
                    filter_query["$or"] = text_conditions
            
            # Apply additional filters
            if filters:
                if filters.get("subjects"):
                    filter_query["subjects"] = {"$in": filters["subjects"]}
                if filters.get("grade_levels"):
                    filter_query["grade_levels"] = {"$in": filters["grade_levels"]}
                if filters.get("resource_type"):
                    filter_query["resource_type"] = filters["resource_type"]
                if filters.get("level"):
                    filter_query["level"] = filters["level"]
                if filters.get("cost"):
                    if filters["cost"] == "free":
                        filter_query["cost"] = "free"
                    elif filters["cost"] == "paid":
                        filter_query["cost"] = {"$ne": "free"}
                if filters.get("max_duration"):
                    # Convert hours to minutes for comparison
                    max_duration_minutes = filters["max_duration"] * 60
                    filter_query["duration_minutes"] = {"$lte": max_duration_minutes}
                if filters.get("format"):
                    filter_query["format"] = {"$in": filters["format"]}
            
            logger.info(f"Database query: {filter_query}")
            
            # Get resources
            cursor = collection.find(filter_query).limit(limit)
            resources_data = await cursor.to_list(length=limit)
            
            logger.info(f"Found {len(resources_data)} resources from database query")
            
            # Convert to PDResource objects
            resources = []
            for resource_data in resources_data:
                try:
                    # Remove _id for PDResource creation
                    resource_data.pop("_id", None)
                    resource = PDResource(**resource_data)
                    resources.append(resource)
                except Exception as e:
                    logger.warning(f"Error converting resource data: {e}")
                    continue
            
            return resources
            
        except Exception as e:
            logger.error(f"Error in fallback search: {e}")
            return []
    
    async def seed_initial_resources(self):
        """Seed the database with initial educational resources"""
        try:
            db = await self.get_database()
            collection = db.resources
            
            # Check if resources already exist
            count = await collection.count_documents({})
            if count > 0:
                logger.info(f"Resources already exist ({count} resources), skipping seed")
                return
            
            # Define initial resources with real links
            initial_resources = [
                {
                    "title": "Classroom Management Strategies for New Teachers",
                    "description": "Comprehensive guide covering proven classroom management techniques, establishing routines, and creating positive learning environments. Includes practical tips for handling disruptions and building student relationships.",
                    "resource_type": "guide",
                    "tags": ["classroom management", "new teachers", "student behavior", "routines"],
                    "duration_minutes": 45,
                    "level": "beginner",
                    "format": "online",
                    "link": "https://www.edutopia.org/classroom-management-guide",
                    "cost": "free",
                    "subjects": ["General Education", "Elementary Education"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                },
                {
                    "title": "Google for Education Certified Trainer Program",
                    "description": "Become a Google for Education Certified Trainer and learn to integrate Google Workspace tools effectively in your classroom. Covers Google Classroom, Docs, Sheets, and more.",
                    "resource_type": "course",
                    "tags": ["google classroom", "technology integration", "digital tools", "certification"],
                    "duration_minutes": 480,
                    "level": "intermediate",
                    "format": "online",
                    "link": "https://edu.google.com/teacher-center/certifications/",
                    "cost": "free",
                    "subjects": ["Technology", "General Education"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                },
                {
                    "title": "Differentiated Instruction Workshop",
                    "description": "Learn how to adapt your teaching methods to meet diverse learning needs. Covers multiple intelligences, learning styles, and practical differentiation strategies.",
                    "resource_type": "workshop",
                    "tags": ["differentiated instruction", "inclusive education", "learning styles", "special needs"],
                    "duration_minutes": 180,
                    "level": "intermediate",
                    "format": "hybrid",
                    "link": "https://www.understood.org/en/school-learning/for-educators/teaching-techniques/differentiated-instruction-what-you-need-to-know",
                    "cost": "low",
                    "subjects": ["Special Education", "General Education"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                },
                {
                    "title": "Khan Academy Teacher Resources",
                    "description": "Free platform offering personalized learning resources, practice exercises, and instructional videos across multiple subjects. Includes teacher dashboard for tracking student progress.",
                    "resource_type": "tool",
                    "tags": ["personalized learning", "math", "science", "free resources", "student tracking"],
                    "duration_minutes": None,
                    "level": "all_levels",
                    "format": "online",
                    "link": "https://www.khanacademy.org/coach-res",
                    "cost": "free",
                    "subjects": ["Mathematics", "Science", "Computer Science"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                },
                {
                    "title": "Social-Emotional Learning Implementation Guide",
                    "description": "Comprehensive resource for implementing SEL programs in schools. Covers emotional intelligence, relationship skills, and creating supportive classroom environments.",
                    "resource_type": "guide",
                    "tags": ["social emotional learning", "SEL", "emotional intelligence", "student wellbeing"],
                    "duration_minutes": 60,
                    "level": "beginner",
                    "format": "online",
                    "link": "https://casel.org/fundamentals-of-sel/",
                    "cost": "free",
                    "subjects": ["Social Studies", "General Education", "Counseling"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                },
                {
                    "title": "Flipgrid: Video Discussion Platform",
                    "description": "Engage students with video discussions and responses. Perfect for building speaking confidence, peer feedback, and asynchronous classroom discussions.",
                    "resource_type": "tool",
                    "tags": ["video discussions", "student engagement", "speaking skills", "peer feedback"],
                    "duration_minutes": 30,
                    "level": "beginner",
                    "format": "online",
                    "link": "https://info.flipgrid.com/",
                    "cost": "free",
                    "subjects": ["Language Arts", "World Languages", "General Education"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                },
                {
                    "title": "Project-Based Learning Essentials",
                    "description": "Learn to design and implement authentic project-based learning experiences. Covers project planning, assessment rubrics, and student collaboration strategies.",
                    "resource_type": "course",
                    "tags": ["project based learning", "PBL", "authentic assessment", "collaboration"],
                    "duration_minutes": 360,
                    "level": "intermediate",
                    "format": "online",
                    "link": "https://www.pblworks.org/what-is-pbl",
                    "cost": "medium",
                    "subjects": ["General Education", "STEM"],
                    "grade_levels": ["6-8", "9-12"]
                },
                {
                    "title": "Canva for Education",
                    "description": "Create engaging visual content for your classroom with Canva's education-specific tools. Includes templates for presentations, posters, and interactive materials.",
                    "resource_type": "tool",
                    "tags": ["visual design", "presentations", "creative tools", "graphic design"],
                    "duration_minutes": 45,
                    "level": "beginner",
                    "format": "online",
                    "link": "https://www.canva.com/education/",
                    "cost": "free",
                    "subjects": ["Art", "General Education", "Marketing"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                },
                {
                    "title": "Formative Assessment Strategies",
                    "description": "Master the art of ongoing assessment to improve student learning. Covers exit tickets, quick polls, peer assessment, and real-time feedback techniques.",
                    "resource_type": "article",
                    "tags": ["formative assessment", "feedback", "student progress", "assessment strategies"],
                    "duration_minutes": 25,
                    "level": "intermediate",
                    "format": "online",
                    "link": "https://www.edutopia.org/assessment-guide-importance",
                    "cost": "free",
                    "subjects": ["General Education"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                },
                {
                    "title": "Mindfulness in the Classroom",
                    "description": "Integrate mindfulness practices to reduce stress and improve focus for both teachers and students. Includes guided exercises and implementation strategies.",
                    "resource_type": "workshop",
                    "tags": ["mindfulness", "stress reduction", "focus", "teacher wellbeing"],
                    "duration_minutes": 120,
                    "level": "beginner",
                    "format": "hybrid",
                    "link": "https://www.mindfulschools.org/",
                    "cost": "medium",
                    "subjects": ["General Education", "Health"],
                    "grade_levels": ["K-5", "6-8", "9-12"]
                }
            ]
            
            # Insert resources
            await collection.insert_many(initial_resources)
            
            # Rebuild vector store
            await self.vector_store.rebuild_from_database()
            
            logger.info(f"Successfully seeded {len(initial_resources)} resources")
            
        except Exception as e:
            logger.error(f"Error seeding resources: {e}")
            raise

# Global instance
resource_service = ResourceService()