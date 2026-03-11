.PHONY: all dev frontend backend install install-frontend install-backend docker-up docker-down

# Directories
FRONTEND_DIR = src/frontend
BACKEND_DIR = src/backend

# Default target
all: dev

# Run both frontend and backend (Requires make -j2 for parallel execution)
dev:
	@echo "Starting frontend and backend..."
	@$(MAKE) -j2 frontend backend

# Run Frontend
frontend:
	@echo "Starting frontend server..."
	cd $(FRONTEND_DIR) && npm run dev

# Run Backend
backend:
	@echo "Starting backend server..."
	cd $(BACKEND_DIR) && python run_backend.py

# Install all dependencies
install: install-frontend install-backend

# Install Frontend dependencies
install-frontend:
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install

# Install Backend dependencies
install-backend:
	@echo "Installing backend dependencies..."
	cd $(BACKEND_DIR) && pip install -r requirements.txt

# Start Docker Compose services
docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d

# Stop Docker Compose services
docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down
