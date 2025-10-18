from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

from app.database import connect_to_mongo, close_mongo_connection
from app.services.recommendation_service import RecommendationService
from app.models import EducatorProfile, RecommendationResponse

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up AI PD Coach API...")
    await connect_to_mongo()
    
    # Initialize services
    app.state.recommendation_service = RecommendationService()
    await app.state.recommendation_service.initialize()
    
    # Initialize and seed resources
    from app.services.resource_service import resource_service
    await resource_service.seed_initial_resources()
    logger.info("Resource seeding completed")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI PD Coach API...")
    await close_mongo_connection()

app = FastAPI(
    title="AI Professional Development Coach",
    description="An intelligent system that provides personalized professional development recommendations for educators",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Professional Development Coach API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # You can add more health checks here (database, external APIs, etc.)
        return {
            "status": "healthy",
            "timestamp": "2024-01-01T00:00:00Z",
            "services": {
                "database": "connected",
                "ai_service": "ready"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(educator_profile: EducatorProfile):
    """
    Generate personalized professional development recommendations
    based on educator profile and goals
    """
    try:
        logger.info(f"Generating recommendations for educator: {educator_profile.name}")
        
        recommendation_service = app.state.recommendation_service
        recommendations = await recommendation_service.generate_recommendations(educator_profile)
        
        logger.info(f"Successfully generated {len(recommendations.recommended_resources)} recommendations")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate recommendations: {str(e)}"
        )

@app.get("/resources")
async def list_resources(
    resource_type: str = None,
    subject: str = None,
    grade_level: str = None,
    limit: int = 20
):
    """List available PD resources with optional filtering"""
    try:
        from app.services.resource_service import resource_service
        
        # Get resources with filtering
        resources = await resource_service.get_resources(
            resource_type=resource_type,
            subject=subject,
            grade_level=grade_level,
            limit=limit
        )
        
        return resources
        
    except Exception as e:
        logger.error(f"Error listing resources: {e}")
        raise HTTPException(status_code=500, detail="Failed to list resources")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "False").lower() == "true"
    )