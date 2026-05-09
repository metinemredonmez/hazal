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

  // CyberPanel/LiteSpeed reverse proxy duplicates the Origin header
  // ("https://x.com, https://x.com") which breaks CORS matching.
  // Sanitize before any CORS middleware sees it.
  app.use((req: { headers: { origin?: string } }, _res: unknown, next: () => void) => {
    const origin = req.headers.origin;
    if (typeof origin === 'string' && origin.includes(',')) {
      req.headers.origin = origin.split(',')[0].trim();
    }
    next();
  });

  const corsOrigins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Array-based CORS — cors paketi her isteği listeye karşı kontrol eder,
  // matching origin'i Access-Control-Allow-Origin'da geri yansıtır.
  // allowedHeaders explicit tanımlanır ki content-type/auth/etc preflight'tan geçsin.
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Disposition'],
    optionsSuccessStatus: 204,
    preflightContinue: false,
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
