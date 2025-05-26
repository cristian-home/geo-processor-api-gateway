# Development Guide - Geo Processor API Gateway

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.development .env
   ```

3. **Start development server**:
   ```bash
   npm run start:dev
   ```

4. **Test the API**:
   ```bash
   ./test-api.sh
   ```

## Development Workflow

### 1. Project Structure
```
src/
├── controllers/          # HTTP controllers
├── services/            # Business logic services
├── dto/                 # Data Transfer Objects
├── modules/             # Feature modules
├── filters/             # Exception filters
└── main.ts             # Application entry point
```

### 2. Available Scripts

- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### 3. Testing Strategy

#### Unit Tests
- Located in `*.spec.ts` files next to source files
- Mock external dependencies (HTTP service, config service)
- Focus on business logic and error handling

#### Integration Tests
- Located in `test/` directory
- Test complete request/response cycles
- Use test database and mock external services

#### API Testing
- Use the provided `test-api.sh` script
- Test all endpoints manually
- Verify error responses and validation

### 4. Environment Configuration

#### Development (.env.development)
- Detailed logging
- Local service URLs
- Debug features enabled
- Shorter cache TTL for testing

#### Production (.env.production)
- Minimal logging
- Production service URLs
- Security features enabled
- Optimized cache settings

### 5. Code Quality

#### ESLint Configuration
- Extends NestJS recommended rules
- Custom rules for consistency
- Automatic fixing available

#### Prettier Configuration
- Consistent code formatting
- Integrated with ESLint
- Pre-commit hooks (optional)

### 6. Architecture Decisions

#### Caching Strategy
- In-memory cache for development
- Redis recommended for production
- Cache key based on request body hash
- Configurable TTL and max items

#### Error Handling
- Global exception filter
- Consistent error response format
- Proper HTTP status codes
- Detailed logging for debugging

#### Validation
- class-validator for DTO validation
- Transform incoming data
- Whitelist and forbid unknown properties
- Custom validation messages

#### Service Communication
- Axios HTTP client via @nestjs/axios
- Timeout and retry configuration
- Proper error handling and mapping
- Circuit breaker pattern (future enhancement)

### 7. Adding New Features

#### 1. Create DTO
```typescript
// src/dto/new-feature.dto.ts
export class NewFeatureDto {
  @IsString()
  name: string;
}
```

#### 2. Create Service
```typescript
// src/services/new-feature.service.ts
@Injectable()
export class NewFeatureService {
  // Implementation
}
```

#### 3. Create Controller
```typescript
// src/controllers/new-feature.controller.ts
@Controller('new-feature')
export class NewFeatureController {
  // Implementation
}
```

#### 4. Create Module
```typescript
// src/modules/new-feature.module.ts
@Module({
  controllers: [NewFeatureController],
  providers: [NewFeatureService],
})
export class NewFeatureModule {}
```

#### 5. Register Module
```typescript
// src/app.module.ts
@Module({
  imports: [
    // ...existing imports
    NewFeatureModule,
  ],
})
export class AppModule {}
```

### 8. Debugging

#### Development Debugging
```bash
npm run start:debug
```

#### VS Code Debug Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug NestJS",
  "program": "${workspaceFolder}/src/main.ts",
  "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

### 9. Performance Monitoring

#### Health Checks
- `/api/health` - Full health check
- `/api/health/ready` - Readiness probe

#### Metrics (Future Enhancement)
- Request duration
- Error rates
- Cache hit rates
- Service response times

### 10. Security Considerations

#### CORS Configuration
- Configured for specific frontend origin
- Appropriate methods and headers
- Production vs development settings

#### Validation
- Input sanitization
- Type checking
- Array size limits
- Required field validation

#### Rate Limiting (Future Enhancement)
- Per-IP rate limiting
- Configurable windows and limits
- Different limits for different endpoints

### 11. Deployment

#### Docker
```bash
# Build image
docker build -t geo-processor-api-gateway .

# Run container
docker run -p 3000:3000 geo-processor-api-gateway
```

#### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api-gateway
```

### 12. Troubleshooting

#### Common Issues

1. **Port already in use**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Python service connection fails**
   - Check Python service is running
   - Verify PYTHON_SERVICE_URL configuration
   - Check network connectivity

3. **Cache issues**
   - Clear cache by restarting service
   - Check cache configuration
   - Monitor cache hit/miss rates

4. **Validation errors**
   - Check DTO definitions
   - Verify class-validator decorators
   - Test with valid data

#### Debugging Steps

1. Check service health: `curl http://localhost:3000/api/health`
2. Check logs for errors
3. Verify environment configuration
4. Test with minimal valid request
5. Check Python service availability

## Best Practices

1. **Always validate input data**
2. **Use proper HTTP status codes**
3. **Log important events and errors**
4. **Handle service unavailability gracefully**
5. **Keep controllers thin, services fat**
6. **Write tests for critical functionality**
7. **Use environment variables for configuration**
8. **Document API endpoints and changes**
