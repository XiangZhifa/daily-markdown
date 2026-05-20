import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // 数据库完整性检查
  const dbPath = process.env.DB_PATH || './data/database.sqlite';
  const fs = require('fs');

  // 确保data目录存在
  const dataDir = require('path').dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 检查数据库文件是否存在
  if (fs.existsSync(dbPath)) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    const getIntegrity = (): Promise<{ integrity_check: string }> => new Promise((resolve, reject) => {
      db.get('PRAGMA integrity_check', (err: Error | null, row: { integrity_check: string }) => {
        db.close();
        if (err) reject(err);
        else resolve(row);
      });
    });
    const integrity = await getIntegrity();

    if (integrity.integrity_check !== 'ok') {
      console.error('Database integrity check failed:', integrity);
      throw new Error(`数据库损坏: ${JSON.stringify(integrity)}`);
    }
    console.log('Database integrity check passed');
  }

  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Markdown Editor API')
    .setDescription('API documentation for Markdown Editor')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global guards - JwtAuthGuard (ThrottlerGuard is already applied via APP_GUARD)
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  // Global interceptors
  app.useGlobalInterceptors(new ResponseFormatInterceptor());

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT || 3000);
  console.log('Server running on http://localhost:3000');
  console.log('Swagger docs at http://localhost:3000/api/docs');
}
bootstrap();