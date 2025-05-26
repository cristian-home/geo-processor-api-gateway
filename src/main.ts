import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );

  // Set global prefix for API routes
  app.setGlobalPrefix('api', { exclude: ['/'] });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Geo Processor API Gateway running on port ${port}`);
  logger.log(
    `📍 Python service URL: ${process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'}`,
  );
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
