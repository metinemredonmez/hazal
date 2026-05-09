import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.use(helmet({ crossOriginResourcePolicy: false }));

  const corsOrigins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Function-based CORS — echoes back matching origin in Access-Control-Allow-Origin.
  // Allows: configured origins + any localhost (dev) + same-origin (no Origin header).
  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!requestOrigin) {
        // Server-to-server / curl without Origin
        callback(null, true);
        return;
      }
      if (corsOrigins.includes(requestOrigin)) {
        callback(null, true);
        return;
      }
      // Allow localhost on any port for local dev
      if (/^https?:\/\/localhost(:\d+)?$/.test(requestOrigin)) {
        callback(null, true);
        return;
      }
      logger.warn(`🚫 CORS blocked origin: ${requestOrigin}`);
      callback(new Error(`Not allowed by CORS: ${requestOrigin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api', { exclude: ['/'] });

  const uploadDir = config.get<string>('UPLOAD_DIR') ?? './uploads';
  app.use('/uploads', express.static(join(process.cwd(), uploadDir)));

  const documentsDir = config.get<string>('DOCUMENTS_DIR') ?? './documents';
  app.use('/documents', express.static(join(process.cwd(), documentsDir)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hazal Muti Real Estate API')
    .setDescription('Backend API for the Hazal Muti real estate site.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  app.getHttpAdapter().get('/', (_req, res) => res.redirect('/docs'));

  const port = parseInt(config.get<string>('PORT') ?? '3001', 10);
  await app.listen(port);
  logger.log(`🚀 API running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/docs`);
  logger.log(`🌐 CORS origins: ${corsOrigins.join(', ')}`);
}

bootstrap();
