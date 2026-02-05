from datetime import datetime
from typing import Any, Dict, List, Optional, Annotated
from pydantic import BaseModel, Field, PlainSerializer, BeforeValidator, ConfigDict
from pydantic.alias_generators import to_camel
from pydantic_extra_types.ulid import ULID as _ULID

def validate_ulid(v: Any) -> Any:
    if isinstance(v, str):
        return v.upper()
    return v

ULID = Annotated[_ULID, PlainSerializer(lambda x: str(x), return_type=str, when_used='json'), BeforeValidator(validate_ulid)]

class ApplicationBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    name: str = Field(..., max_length=256)
    comments: Optional[str] = Field(None, max_length=1024)

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(ApplicationBase):
    name: Optional[str] = Field(None, max_length=256)

class Application(ApplicationBase):
    id: ULID
    configuration_ids: List[ULID] = []

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

class ConfigurationBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    application_id: ULID
    name: str = Field(..., max_length=256)
    comments: Optional[str] = Field(None, max_length=1024)
    config: Dict[str, Any]

class ConfigurationCreate(ConfigurationBase):
    pass

class ConfigurationUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    name: Optional[str] = Field(None, max_length=256)
    comments: Optional[str] = Field(None, max_length=1024)
    config: Optional[Dict[str, Any]] = None

class Configuration(ConfigurationBase):
    id: ULID

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

class User(BaseModel):
    id: int
    username: str
    password_hash: str

class Token(BaseModel):
    token: str
