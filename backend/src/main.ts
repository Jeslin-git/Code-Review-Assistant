import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://codeai-swart.vercel.app',
      /^https:\/\/codeai-[a-z0-9]+-jeslins-projects-5f8dd491\.vercel\.app$/,
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}

void bootstrap();
