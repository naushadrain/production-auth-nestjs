
import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Create the NestJS application using the root module.
  const app = await NestFactory.create(AppModule);

  // Access environment configuration through NestJS ConfigService.
  const configService = app.get(ConfigService);

  // Parse cookies from incoming HTTP requests.
  // Example: req.cookies.refreshToken
  app.use(cookieParser());

  // Add a global API prefix.
  // All API routes will start with /api.
  app.setGlobalPrefix('api');

  // Enable URI-based API versioning.
  // Version 1 routes will start with /v1.
  // Combined with the global prefix, routes become /api/v1/...
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validate incoming request bodies, query parameters, and DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not declared in the DTO.
      forbidNonWhitelisted: true, // Reject requests containing unknown properties.
      transform: true, // Convert incoming values to their DTO types when possible.
    }),
  );

  // Handle HTTP exceptions consistently across the application.
  // This is a filter, not a validation pipe.
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure the Swagger API documentation.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Production Auth API')
    .setDescription('API documentation for the production authentication system.')
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('tasks', 'Task management endpoints')
    .addBearerAuth() // Document JWT Bearer authentication for protected endpoints.
    .build();

  // Generate the OpenAPI document from your controllers and DTOs.
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  // Serve the Swagger UI at /api/docs.
  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
  });

  // Read the port from configuration; use 3000 if PORT is not configured.
  const port = configService.get<number>('PORT') ?? 3000;

  // Start listening for incoming HTTP requests.
  await app.listen(port);

  // Print the useful URLs when the application starts.
  console.log(`Application: http://localhost:${port}/api/v1`);
  console.log(`Swagger UI:  http://localhost:${port}/api/docs`);
}

// Start the application.
await bootstrap();
