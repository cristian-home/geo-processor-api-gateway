# Geo Processor API Gateway

A NestJS-based API gateway that serves as an intermediary between the frontend and the Python FastAPI geo-processing service. This gateway provides request validation, caching, error handling, and proper HTTP communication.

## Features

- **Request Validation**: Validates incoming coordinate data using class-validator
- **Caching**: Implements intelligent caching to reduce load on the Python service
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Health Checks**: Monitor the health of both the gateway and Python service
- **CORS Support**: Properly configured for frontend communication
- **Logging**: Structured logging for monitoring and debugging

## Architecture

```
Frontend (Next.js) → API Gateway (NestJS) → Python Service (FastAPI)
```

The API Gateway acts as:
1. **Request Validator**: Ensures all incoming requests have valid coordinate data
2. **Cache Layer**: Stores frequently requested results to improve performance
3. **Error Handler**: Provides consistent error responses to the frontend
4. **Service Proxy**: Forwards validated requests to the Python service

## API Endpoints

### Process Coordinates
- **Endpoint**: `POST /api/geo-processor/process`
- **Description**: Processes a list of coordinates and returns centroid and bounds
- **Request Body**:
```json
{
  "points": [
    { "lat": 40.7128, "lng": -74.0060 },
    { "lat": 34.0522, "lng": -118.2437 }
  ]
}
```

- **Response**:
```json
{
  "centroid": { "lat": 37.3825, "lng": -96.1248 },
  "bounds": {
    "north": 40.7128,
    "south": 34.0522,
    "east": -74.006,
    "west": -118.2437
  }
}
```

### Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Check the health of the API gateway and Python service
- **Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-05-26T10:00:00.000Z",
  "services": {
    "api-gateway": {
      "status": "healthy",
      "version": "0.0.1"
    },
    "python-service": {
      "status": "healthy",
      "service": "python-fastapi",
      "timestamp": "2025-05-26T10:00:00.000Z"
    }
  }
}
```

### Readiness Check
- **Endpoint**: `GET /api/health/ready`
- **Description**: Check if the service is ready to handle requests

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
# NestJS API Gateway Configuration
PORT=3000

# Python FastAPI Service Configuration
PYTHON_SERVICE_URL=http://localhost:8000

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:3001

# Cache Configuration
CACHE_TTL=300
CACHE_MAX_ITEMS=100

# Logging Level
LOG_LEVEL=debug
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

## Error Handling

The API Gateway handles various error scenarios:

- **400 Bad Request**: Invalid input data (missing fields, wrong data types)
- **503 Service Unavailable**: Python service is down or unreachable
- **500 Internal Server Error**: Unexpected errors

All errors return a consistent format:
```json
{
  "statusCode": 400,
  "timestamp": "2025-05-26T10:00:00.000Z",
  "path": "/api/geo-processor/process",
  "method": "POST",
  "message": "Error description"
}
```

## Caching Strategy

- **Cache Duration**: 5 minutes (configurable via `CACHE_TTL`)
- **Cache Key**: Based on request body hash
- **Cache Size**: Maximum 100 items (configurable via `CACHE_MAX_ITEMS`)
- **Cache Invalidation**: Automatic based on TTL

## Validation Rules

### Coordinate Validation
- `lat` (latitude): Must be a number
- `lng` (longitude): Must be a number

### Request Validation
- `points`: Must be a non-empty array
- Each point must have valid `lat` and `lng` values

## Dependencies

### Core Dependencies
- `@nestjs/common`: Core NestJS functionality
- `@nestjs/core`: NestJS core module
- `@nestjs/platform-express`: Express platform adapter
- `@nestjs/axios`: HTTP client for service communication
- `@nestjs/cache-manager`: Caching functionality
- `@nestjs/config`: Configuration management

### Validation & Transformation
- `class-validator`: Request validation
- `class-transformer`: Data transformation

### Utilities
- `axios`: HTTP client
- `rxjs`: Reactive programming
- `cache-manager`: Cache implementation

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker Support

The application can be containerized for deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Monitoring

The application provides:
- Health check endpoints for load balancer integration
- Structured logging for monitoring systems
- Error tracking with stack traces
- Performance metrics through caching

## Development Guidelines

1. **Service Communication**: All Python service calls should go through the `GeoProcessorService`
2. **Error Handling**: Use proper HTTP status codes and error messages
3. **Validation**: Always validate input data using DTOs
4. **Caching**: Consider cache invalidation strategies for data consistency
5. **Logging**: Use the NestJS Logger for consistent log formatting

## Future Enhancements

- Rate limiting to prevent abuse
- Authentication and authorization
- Metrics collection and monitoring
- Circuit breaker pattern for service resilience
- Request/response compression
- API documentation with Swagger/OpenAPI
