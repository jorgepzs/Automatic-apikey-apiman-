import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JiraService } from '../service/jira.service';
import { KeycloakService } from '../service/keycloak.service';
import { ApimanService } from '../service/apiman.service';
import { ApiKeyCron } from '../cron/apiKey.cron';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule, ScheduleModule.forRoot()],
  providers: [JiraService, ApiKeyCron, KeycloakService, ApimanService],
  controllers: [],
  exports: [],
})
export class KeyModule {}

// ApiKeyCron, ApimanService, KeycloakService,
