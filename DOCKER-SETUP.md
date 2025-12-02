# Docker Setup Guide - Conference Room Booking System

## Prerequisites

- Docker Desktop installed (Windows/Mac/Linux)
- Docker Compose v3.8 or higher
- At least 4GB of available RAM

## Project Structure

```
.
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── docker-compose.yml           # Production
├── docker-compose.dev.yml       # Development
└── .env.example
```

## Quick Start

### Production Deployment

1. **Clone and navigate to project directory**
   ```bash
   cd "C:\Users\AJALRP\Documents\Trash Files\.NET\AITutorial"
   ```

2. **Create environment file**
   ```bash
   copy .env.example .env
   # Edit .env with your production values
   ```

3. **Build and start all services**
   ```bash
   docker-compose up -d --build
   ```

4. **Access the applications**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5000
   - Swagger: http://localhost:5000/swagger
   - Database: localhost:1433

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

### Development Mode

Development mode includes hot-reload for both frontend and backend.

1. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d --build
   ```

2. **Access the applications**
   - Frontend: http://localhost:4200 (Hot reload enabled)
   - Backend API: http://localhost:7001 (Watch mode enabled)
   - Database: localhost:1433

3. **View logs**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f backend
   docker-compose -f docker-compose.dev.yml logs -f frontend
   ```

4. **Stop development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Docker Commands

### Build Specific Service
```bash
# Build backend only
docker-compose build backend

# Build frontend only
docker-compose build frontend
```

### Start Specific Service
```bash
docker-compose up -d backend
docker-compose up -d frontend
```

### Restart Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### View Service Status
```bash
docker-compose ps
```

### Execute Commands Inside Container
```bash
# Backend - Run migrations
docker-compose exec backend dotnet ef database update

# Backend - Access bash
docker-compose exec backend /bin/bash

# Frontend - Access shell
docker-compose exec frontend /bin/sh
```

### Remove Everything (including volumes)
```bash
docker-compose down -v
```

## Environment Variables

### Backend (.env)
```env
DB_PASSWORD=YourStrong@Passw0rd
JWT_SECRET_KEY=your-super-secret-key-min-32-characters
BACKEND_PORT=5000
```

### Frontend
Frontend configuration is handled via environment files in `src/environments/`

## Database Access

### Using SQL Server Management Studio (SSMS)
- Server: localhost,1433
- Username: sa
- Password: YourStrong@Passw0rd (or from .env)
- Database: ConferenceRoomBookingDb

### Using Docker exec
```bash
docker-compose exec database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
```

## Troubleshooting

### Backend fails to start
```bash
# Check backend logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait for health check
# 2. Connection string incorrect
# 3. JWT secret key too short (min 32 chars)
```

### Frontend fails to build
```bash
# Check frontend logs
docker-compose logs frontend

# Common issues:
# 1. Node modules not installed
# 2. Build errors - check Angular version compatibility
```

### Database connection issues
```bash
# Check database health
docker-compose ps database

# Restart database
docker-compose restart database

# View database logs
docker-compose logs database
```

### Port already in use
```bash
# Change ports in docker-compose.yml
services:
  backend:
    ports:
      - "5001:80"  # Change 5000 to 5001
```

## Production Considerations

### Security
1. **Change default passwords**
   - Update SA_PASSWORD in docker-compose.yml
   - Update JWT_SECRET_KEY to a strong random value

2. **Use environment variables**
   - Never commit .env file
   - Use secrets management in production

3. **Enable HTTPS**
   - Add SSL certificates
   - Configure reverse proxy (Nginx/Traefik)

### Performance
1. **Resource limits**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
   ```

2. **Database backups**
   ```bash
   docker-compose exec database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "BACKUP DATABASE [ConferenceRoomBookingDb] TO DISK = N'/var/opt/mssql/backup/db.bak'"
   ```

### Monitoring
1. **Health checks**
   - Backend: http://localhost:5000/health
   - Database: Built-in health check

2. **Log aggregation**
   ```bash
   # Stream all logs
   docker-compose logs -f --tail=100
   ```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Build and push Docker images
  run: |
    docker-compose build
    docker-compose push
```

### Azure Container Registry
```bash
# Tag images
docker tag conference-booking-api:latest yourregistry.azurecr.io/conference-booking-api:latest

# Push to ACR
docker push yourregistry.azurecr.io/conference-booking-api:latest
```

## Cleanup

### Remove all containers and images
```bash
docker-compose down --rmi all -v
```

### Remove unused Docker resources
```bash
docker system prune -a --volumes
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs [service-name]`
2. Review this documentation
3. Check Docker daemon status
4. Verify system resources (RAM, disk space)

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [ASP.NET Core Docker Guide](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)
- [Angular Docker Guide](https://angular.io/guide/deployment#docker)
