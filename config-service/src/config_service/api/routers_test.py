import pytest
from unittest.mock import MagicMock, patch, AsyncMock
import ulid
from pydantic_extra_types.ulid import ULID
from config_service.api.routers import create_application, get_application, delete_configuration
from config_service.models import ApplicationCreate, User

# Helper: create a mock user for dependency injection
def make_mock_user():
    return User(id=1, username="testuser", github_id=12345, avatar_url=None, email="test@example.com")

@pytest.mark.asyncio
@patch("config_service.api.routers.execute_query", new_callable=AsyncMock)

async def test_create_application(mock_execute):
    async def side_effect(query, params=None):
        if "RETURNING id" in query and params:
            return [{"id": params[0]}]
        return []
    mock_execute.side_effect = side_effect
    app_data = ApplicationCreate(name="test-app", comments="test-comment")
    
    result = await create_application(app_data, current_user=make_mock_user())
    
    assert result.name == "test-app"
    assert mock_execute.called

@pytest.mark.asyncio
@patch("config_service.api.routers.execute_query", new_callable=AsyncMock)
async def test_get_application_not_found(mock_execute):
    mock_execute.return_value = []
    app_id = str(ulid.ULID())
    
    with pytest.raises(Exception) as excinfo:
        await get_application(app_id, current_user=make_mock_user())
    # FastAPI raises HTTPException but here we call it directly
    # In a real test with TestClient it would be 404

@pytest.mark.asyncio
@patch("config_service.api.routers.execute_query", new_callable=AsyncMock)
async def test_delete_configuration(mock_execute):
    mock_execute.return_value = [{"id": "some-id"}]
    
    await delete_configuration("some-id", current_user=make_mock_user())
    
    assert mock_execute.called
    args, _ = mock_execute.call_args
    assert "DELETE FROM configurations" in args[0]
