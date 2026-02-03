import pytest
from unittest.mock import MagicMock, patch
from config_service.db import init_db, execute_query

@pytest.mark.asyncio
@patch("config_service.db.ThreadedConnectionPool")
async def test_init_db(mock_pool_class):
    with patch("config_service.db.settings") as mock_settings:
        mock_settings.db_url = "postgresql://user:pass@localhost/db"
        init_db()
        assert mock_pool_class.called

@pytest.mark.asyncio
@patch("config_service.db._pool")
async def test_execute_query_no_pool(mock_pool):
    # This should trigger init_db if pool is None, but here we mock the global
    pass
