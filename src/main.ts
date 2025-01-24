import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('process.env.FRONTEND_URL', process.env.FRONTEND_URL);

  app.enableCors({
    origin:
      process.env.FRONTEND_URL || 'https://jacuzzi-slots-gimel.netlify.app', // Allow frontend URL
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
