from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from pydantic_extra_types.ulid import ULID

class ApplicationBase(BaseModel):
    name: str = Field(..., max_length=256)
    comments: Optional[str] = Field(None, max_length=1024)

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(ApplicationBase):
    name: Optional[str] = Field(None, max_length=256)

class Application(ApplicationBase):
    id: ULID
    configuration_ids: List[ULID] = []

    class Config:
        from_attributes = True

class ConfigurationBase(BaseModel):
    application_id: ULID
    name: str = Field(..., max_length=256)
    comments: Optional[str] = Field(None, max_length=1024)
    config: Dict[str, Any]

class ConfigurationCreate(ConfigurationBase):
    pass

class ConfigurationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=256)
    comments: Optional[str] = Field(None, max_length=1024)
    config: Optional[Dict[str, Any]] = None

class Configuration(ConfigurationBase):
    id: ULID

    class Config:
        from_attributes = True
