import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1', { exclude: ['/'] });

  const config = new DocumentBuilder()
    .setTitle('Hooray HOA API')
    .setDescription('Empowering HOAs with innovative, user-friendly technology to enhance community management, transparency, and engagement.')
    .setVersion('1.0')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  await app.listen(3000);
}
bootstrap();
