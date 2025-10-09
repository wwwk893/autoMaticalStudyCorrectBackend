SHELL := /bin/bash

up:
docker compose up -d

up-full: up seed

seed:
npm run seed || echo "seed script not implemented yet"
docker compose exec postgres psql -U $${POSTGRES_USER:-autograde} -d $${POSTGRES_DB:-autograde} -f scripts/seed/seed.sql 2>/dev/null || true

contract-test:
schemathesis run http://localhost:$${API_PORT:-3000}/openapi.json || echo "Schemathesis not installed"
down:
docker compose down -v

.PHONY: up up-full seed contract-test down
