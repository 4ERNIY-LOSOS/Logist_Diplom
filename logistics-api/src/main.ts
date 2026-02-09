import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe

async function bootstrap() {
  process.env.TZ = 'UTC'; // Set timezone for the Node.js process
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable transformation of incoming payload objects to DTO instances
      whitelist: true, // Automatically remove properties that are not defined in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Logistics API')
    .setDescription('The API for managing logistics services')
    .setVersion('1.0')
    .addTag('requests') // Пример тега
    .addBearerAuth(
      // Add this line for JWT authentication
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name is important for applying security globally or per operation
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Доступно по /api

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Allow frontend dev server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
