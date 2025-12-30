# Docker Commands - Medicine Tracking System

## Quick Start Guide

### Prerequisites
- Docker Desktop installed and running
- Navigate to the project root directory before running commands

---

## Starting the Application

### Option 1: Start All Services (Recommended)
```bash
cd C:\Users\KF-Admin\Public\MedicineTrackingSystem
docker-compose up --build
```

### Option 2: Start in Background (Detached Mode)
```bash
cd C:\Users\KF-Admin\Public\MedicineTrackingSystem
docker-compose up --build -d
```

### Option 3: Start Services Individually
```bash
# Start MySQL first
docker-compose up -d mysql

# Wait 10-15 seconds for MySQL to initialize, then start the API
docker-compose up -d api

# Finally start the frontend
docker-compose up -d frontend
```

---

## Viewing Logs

### View All Service Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
# Frontend logs
docker-compose logs -f frontend

# Backend API logs
docker-compose logs -f api

# MySQL logs
docker-compose logs -f mysql
```

### View Last 100 Lines
```bash
docker-compose logs --tail=100 -f
```

---

## Stopping the Application

### Stop All Services (Keep Data)
```bash
docker-compose down
```

### Stop All Services and Remove Volumes (Clean Slate)
```bash
docker-compose down -v
```

### Stop Specific Service
```bash
docker-compose stop frontend
docker-compose stop api
docker-compose stop mysql
```

---

## Managing Services

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart frontend
docker-compose restart api
docker-compose restart mysql
```

### Rebuild Specific Service
```bash
# Rebuild frontend only
docker-compose up --build frontend

# Rebuild backend only
docker-compose up --build api
```

### Check Running Containers
```bash
docker ps
```

### Check All Containers (Including Stopped)
```bash
docker ps -a
```

---

## Access Points

Once all services are running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation (Swagger)**: http://localhost:8080/swagger
- **MySQL Database**: localhost:3306
  - Username: `drugapp`
  - Password: `Drugapp123!`
  - Database: `MedicineTrackingDB`

---

## Troubleshooting

### View Container Status
```bash
docker-compose ps
```

### Check Container Health
```bash
docker inspect medicine-tracking-frontend
docker inspect medicine-tracking-api
docker inspect mysql-local
```

### Remove All Containers and Start Fresh
```bash
docker-compose down -v
docker-compose up --build -d
```

### Access Container Shell
```bash
# Frontend container
docker exec -it medicine-tracking-frontend sh

# Backend container
docker exec -it medicine-tracking-api sh

# MySQL container
docker exec -it mysql-local bash
```

### View Database from MySQL Container
```bash
docker exec -it mysql-local mysql -u drugapp -pDrugapp123! MedicineTrackingDB
```

---

## Development Workflow

### 1. First Time Setup
```bash
cd C:\Users\KF-Admin\Public\MedicineTrackingSystem
docker-compose up --build -d
docker-compose logs -f
```

### 2. After Code Changes

#### Frontend Changes
```bash
docker-compose up --build -d frontend
```

#### Backend Changes
```bash
docker-compose up --build -d api
```

### 3. Daily Development
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop when done
docker-compose down
```

---

## Additional Commands

### Clean Up Docker System
```bash
# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune

# Clean everything (use with caution)
docker system prune -a
```

### Check Docker Disk Usage
```bash
docker system df
```

### Export/Import Database

#### Export Database
```bash
docker exec mysql-local mysqldump -u drugapp -pDrugapp123! MedicineTrackingDB > backup.sql
```

#### Import Database
```bash
docker exec -i mysql-local mysql -u drugapp -pDrugapp123! MedicineTrackingDB < backup.sql
```

---

## Notes

- Always run commands from the project root directory (`MedicineTrackingSystem`)
- Use `Ctrl+C` to exit log viewing (containers will continue running in detached mode)
- The first build will take longer as it downloads base images and installs dependencies
- Subsequent builds will be faster due to Docker layer caching
- Database data persists in a Docker volume named `mysql-data`

---

## Common Issues

### Port Already in Use
If you get a "port already in use" error:
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8080
netstat -ano | findstr :3306

# Kill the process or change the port in docker-compose.yml
```

### MySQL Connection Issues
```bash
# Restart MySQL and wait for it to be ready
docker-compose restart mysql
docker-compose logs -f mysql
# Wait for "ready for connections" message
```

### Frontend Not Loading
```bash
# Rebuild frontend
docker-compose up --build -d frontend
docker-compose logs -f frontend
```

---

**Last Updated**: 2025-10-29
**Project**: Medicine Tracking System
**Docker Version**: Compatible with Docker Desktop 4.x+
