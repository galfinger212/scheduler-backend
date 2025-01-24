import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('process.env.FRONTEND_URL', process.env.FRONTEND_URL);

  app.enableCors({
    origin:
      process.env.FRONTEND_URL || 'https://jacuzzi-slots-gimel.netlify.app', // Allow frontend URL
    credentials: true, // Allow cookies and Authorization headers
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization', // Allow these headers
  });

  app.use((req, res, next) => {
    console.log('Request Origin:', req.headers.origin);
    console.log('Request Method:', req.method);

    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'https://jacuzzi-slots-gimel.netlify.app',
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(204).end(); // Respond to preflight request
    }

    next();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
