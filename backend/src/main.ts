import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { json } from 'express';

import * as fs from 'fs';
import * as path from 'path';

function seedTemplates() {
  const defaultDir = path.join(process.cwd(), 'default_plantillas', 'plantillas');
  const uploadsDir = path.join(process.cwd(), 'uploads', 'plantillas');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (fs.existsSync(defaultDir)) {
    const files = fs.readdirSync(defaultDir);
    for (const file of files) {
      const dest = path.join(uploadsDir, file);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(defaultDir, file), dest);
      }
    }
  }
}

async function bootstrap() {
  seedTemplates();
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.use(cookieParser());
  // Aumentar límite para soportar imágenes en Base64 (hasta 20MB)
  app.use(json({ limit: '20mb' }));
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
