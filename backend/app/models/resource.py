from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ResourceType(str, Enum):
    WORKSHOP = "workshop"
    TOOL = "tool"
    ARTICLE = "article"
    GUIDE = "guide"
    VIDEO = "video"
    COURSE = "course"

class ResourceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ALL_LEVELS = "all_levels"

class ResourceFormat(str, Enum):
    ONLINE = "online"
    IN_PERSON = "in_person"
    HYBRID = "hybrid"
    SELF_PACED = "self_paced"
    LIVE = "live"

class PDResource(BaseModel):
    title: str = Field(..., description="Resource title")
    description: str = Field(..., description="Detailed description of the resource")
    resource_type: ResourceType = Field(..., description="Type of resource")
    tags: List[str] = Field(default=[], description="Tags for categorization and search")
    duration_minutes: Optional[int] = Field(None, description="Duration in minutes")
    level: ResourceLevel = Field(default=ResourceLevel.ALL_LEVELS, description="Difficulty level")
    format: ResourceFormat = Field(..., description="Format of the resource")
    link: Optional[str] = Field(None, description="URL to access the resource")
    cost: Optional[str] = Field("free", description="Cost information (free, low, medium, high)")
    subjects: List[str] = Field(default=[], description="Applicable subjects")
    grade_levels: List[str] = Field(default=[], description="Applicable grade levels")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ResourceCreate(BaseModel):
    title: str
    description: str
    resource_type: ResourceType
    tags: List[str] = []
    duration_minutes: Optional[int] = None
    level: ResourceLevel = ResourceLevel.ALL_LEVELS
    format: ResourceFormat
    link: Optional[str] = None
    cost: Optional[str] = "free"
    subjects: List[str] = []
    grade_levels: List[str] = []

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[ResourceType] = None
    tags: Optional[List[str]] = None
    duration_minutes: Optional[int] = None
    level: Optional[ResourceLevel] = None
    format: Optional[ResourceFormat] = None
    link: Optional[str] = None
    cost: Optional[str] = None
    subjects: Optional[List[str]] = None
    grade_levels: Optional[List[str]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)