.PHONY: run test migrate setup

PYTHON = uv run python

run:
	$(PYTHON) -m uvicorn src.config_service.main:app --reload

test:
	$(PYTHON) -m pytest

migrate:
	$(PYTHON) -m src.config_service.migrations

setup:
	uv sync
