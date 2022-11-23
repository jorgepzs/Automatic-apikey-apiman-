import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';

import { KeyModule } from './module/key.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    HttpModule,
    KeyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
