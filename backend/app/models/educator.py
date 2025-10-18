from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class EducatorProfile(BaseModel):
    name: str = Field(..., description="Educator's full name")
    grade_levels: List[str] = Field(..., description="Grade levels taught (e.g., ['K-2', '3-5', 'Middle School'])")
    subjects: List[str] = Field(..., description="Subjects taught (e.g., ['Math', 'Science', 'English'])")
    teaching_goals: List[str] = Field(..., description="Professional development goals")
    available_time_per_week: int = Field(..., description="Available time for PD in minutes per week")
    budget_constraint: Optional[str] = Field(None, description="Budget constraint (e.g., 'low', 'medium', 'high', 'none')")
    experience_level: Optional[str] = Field("intermediate", description="Teaching experience level")
    preferred_format: Optional[List[str]] = Field(default=[], description="Preferred learning formats")

class EducatorSession(BaseModel):
    educator_id: Optional[str] = None
    profile: EducatorProfile
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    recommendations: Optional[List[dict]] = None
    coach_message: Optional[str] = None
    action_steps: Optional[List[str]] = None

class EducatorProfileUpdate(BaseModel):
    name: Optional[str] = None
    grade_levels: Optional[List[str]] = None
    subjects: Optional[List[str]] = None
    teaching_goals: Optional[List[str]] = None
    available_time_per_week: Optional[int] = None
    budget_constraint: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_format: Optional[List[str]] = None