from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .resource import PDResource

class ActionStep(BaseModel):
    step: str = Field(..., description="Actionable step description")
    priority: Optional[str] = Field("medium", description="Priority level (high, medium, low)")
    estimated_time: Optional[int] = Field(None, description="Estimated time in minutes")

class RecommendationResponse(BaseModel):
    coach_message: str = Field(..., description="Personalized coaching message")
    action_steps: List[ActionStep] = Field(..., description="List of actionable next steps")
    recommended_resources: List[PDResource] = Field(..., description="Recommended PD resources")
    confidence_score: Optional[float] = Field(None, description="AI confidence in recommendations (0-1)")
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class RecommendationRequest(BaseModel):
    educator_profile: dict = Field(..., description="Educator profile data")
    max_resources: Optional[int] = Field(5, description="Maximum number of resources to recommend")
    focus_areas: Optional[List[str]] = Field(None, description="Specific areas to focus on")

class CoachingPrompt(BaseModel):
    system_prompt: str = Field(..., description="System prompt for the AI coach")
    user_context: str = Field(..., description="User-specific context for personalization")
    resource_context: str = Field(..., description="Context about available resources")

class RecommendationLog(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    educator_profile: dict = Field(..., description="Educator profile used")
    query_vector: Optional[List[float]] = Field(None, description="Query embedding vector")
    retrieved_resources: List[str] = Field(..., description="Resource IDs retrieved from vector search")
    final_recommendations: List[str] = Field(..., description="Final recommended resource IDs")
    coach_message: str = Field(..., description="Generated coaching message")
    action_steps: List[ActionStep] = Field(..., description="Generated action steps")
    processing_time_ms: Optional[int] = Field(None, description="Processing time in milliseconds")
    created_at: datetime = Field(default_factory=datetime.utcnow)