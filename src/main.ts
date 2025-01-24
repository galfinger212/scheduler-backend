import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('process.env.FRONTEND_URL', process.env.FRONTEND_URL);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type,Authorization',
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.status(204).send(); // Respond with no content
    } else {
      next();
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
