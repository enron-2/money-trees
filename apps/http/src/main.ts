import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DevHttpModule } from './http.module';

/**
 * NOT FOR PRODUCTION
 * Used to locally test api and inspect API documentation
 */
async function bootstrap() {
  const app = await NestFactory.create(DevHttpModule);

  const config = new DocumentBuilder()
    .setTitle('Money Tr33s')
    .setDescription(
      `<h3>The perfect place for shade.</h3>
      <br>
      <div id=content>
      <div id=enron>
        <img 
          src="/assets/enron.gif"
          width="160"
          alt="Enron logo"
        />
      </div>
      <div>
        <br>
        Not fully tested, some reponse and request may differ from what is actually documented.
        <br>
        Repo located at: <a href="https://github.com/cs9447-team2/money-trees">enron2/money-trees</a>
      </div>
      </div>
      `,
    )
    .setVersion('0.0.0')
    .build();
  const docs = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, docs, {
    customCssUrl: '/assets/SwaggerDark.css',
    customCss: `
    #content {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    #enron {
      margin: 0px 24px;
    }`,
    customfavIcon: '/assets/enron2.png',
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(3000);
}
bootstrap();
