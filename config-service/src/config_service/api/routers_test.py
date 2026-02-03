import pytest
from unittest.mock import MagicMock, patch
from pydantic_extra_types.ulid import ULID
from config_service.api.routers import create_application, get_application
from config_service.models import ApplicationCreate

@pytest.mark.asyncio
@patch("config_service.api.routers.execute_query")
@patch("config_service.api.routers.ULID")
async def test_create_application(mock_ulid, mock_execute):
    mock_ulid.return_value = ULID()
    mock_execute.return_value = [{"id": str(mock_ulid.return_value)}]
    app_data = ApplicationCreate(name="test-app", comments="test-comment")
    
    # We also need to mock init_db since it's called in get_db_cursor or similar helpers
    # but here we call create_application which calls execute_query
    result = await create_application(app_data)
    
    assert result.name == "test-app"
    assert mock_execute.called

@pytest.mark.asyncio
@patch("config_service.api.routers.execute_query")
async def test_get_application_not_found(mock_execute):
    mock_execute.return_value = []
    ulid = ULID()
    
    with pytest.raises(Exception) as excinfo:
        await get_application(ulid)
    # FastAPI raises HTTPException but here we call it directly
    # In a real test with TestClient it would be 404
