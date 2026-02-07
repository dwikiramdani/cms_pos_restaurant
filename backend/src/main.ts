import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Restaurant POS CMS API')
    .setDescription('API documentation for Restaurant POS CMS System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management')
    .addTag('Roles', 'Role-based access control')
    .addTag('Menu', 'Menu and catalog management')
    .addTag('Orders', 'Order processing and management')
    .addTag('Kitchen', 'Kitchen Display System')
    .addTag('Payments', 'Payment processing')
    .addTag('Promotions', 'Promotions and discounts')
    .addTag('Reports', 'Analytics and reporting')
    .addTag('Branches', 'Multi-branch management')
    .addTag('Settings', 'System configuration')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
  console.log(`🔌 WebSocket server running on port ${configService.get<number>('WS_PORT') || 3001}`);
}

bootstrap();
