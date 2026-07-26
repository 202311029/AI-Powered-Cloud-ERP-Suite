import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // ─── Security ─────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  app.use(cookieParser());

  // ─── Global Pipes, Filters, Interceptors ──────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TenantContextInterceptor(),
  );

  // ─── API Versioning & Prefix ───────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');


  // ─── Swagger / OpenAPI 3.1 ────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Amdox ERP API')
    .setDescription('AI-Powered Cloud ERP Suite — OpenAPI 3.1 Reference')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addServer('http://localhost:5000', 'Local Development')
    .addTag('Auth', 'Authentication & MFA')
    .addTag('Finance', 'General Ledger, AP/AR, FX')
    .addTag('HR', 'Employees, Leave, Attendance')
    .addTag('Payroll', 'Payroll runs & payslips')
    .addTag('Supply', 'Vendors, POs, Inventory, GR')
    .addTag('Projects', 'Projects, Tasks, Timesheets')
    .addTag('BI', 'Dashboards, Reports, Analytics')
    .addTag('Audit', 'Immutable audit trail')
    .addTag('Notifications', 'In-app, email, webhook')
    .addTag('Health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Amdox ERP API Docs',
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Amdox ERP — NestJS 11 Backend Running               ║
╟──────────────────────────────────────────────────────────────╢
║  API:     http://localhost:${port}/api/v1                       ║
║  Swagger: http://localhost:${port}/api-docs                     ║
║  Health:  http://localhost:${port}/api/v1/health                ║
╚══════════════════════════════════════════════════════════════╝`);
}

bootstrap();
