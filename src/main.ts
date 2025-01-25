import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('process.env.FRONTEND_URL', process.env.FRONTEND_URL);

  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'], // Replace with your frontend URL
    credentials: true, // Enable cookies and credentials
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allow specific HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Allow specific headers
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
