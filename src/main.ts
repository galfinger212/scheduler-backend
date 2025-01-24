import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL, // Frontend URL
    credentials: true, // Allow cookies or Authorization headers
  });
  const port = process.env.PORT || 3000;
  await app.listen(port); // Ensure the backend runs on a specific port
}
bootstrap();
