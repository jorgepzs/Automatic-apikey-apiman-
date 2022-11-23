import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Apiman Key Generator')
      .setDescription('Apiman Key Generator')
      .build(),
  );
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();

  await app.listen(8087);
}

bootstrap();
