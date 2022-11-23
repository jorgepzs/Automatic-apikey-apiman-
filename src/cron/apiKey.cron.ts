import { HttpException, Injectable, Logger } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';
import { ApimanService } from '../service/apiman.service';
import { JiraService } from '../service/jira.service';
import { KeycloakService } from '../service/keycloak.service';

@Injectable()
export class ApiKeyCron {
  private readonly logger = new Logger(ApiKeyCron.name);

  constructor(
    private jira: JiraService,
    private keycloak: KeycloakService,
    private apiman: ApimanService,
  ) {}

  @Cron('*/30 * * * * *')
  async main(): Promise<any> {
    try {
      this.logger.log(`::${ApiKeyCron.name}.main::Init`);

      // Goal -> Get Issue on JIRA for generate API KEY in APIMAN
      const getIssue = await this.jira.getIssue();
      console.log(getIssue);
      // Goal -> Generate API KEY in APIMAN
      const getCredentials = await this.keycloak.getCredentials();
      const createClient = await this.apiman.createClient(
        getCredentials,
        getIssue.partner,
      );
      const createContract = await this.apiman.createContract(
        getCredentials,
        getIssue.api,
        getIssue.partner,
      );
      const registerClient = await this.apiman.registerClient(
        getCredentials,
        getIssue.api,
        getIssue.partner,
      );
      const getApiKey = await this.apiman.getApiKey(
        getCredentials,
        getIssue.api,
        getIssue.partner,
      );

      // Goal -> Comment in Issue the API KEY generated and close it
      const commentIssue = await this.jira.commentIssue(
        getIssue.id,
        getApiKey.apikey,
      );
      const closeIssue = await this.jira.closeIssue(getIssue.id);

      this.logger.log(`::${ApiKeyCron.name}.main::End`);

      this.logger.log(
        JSON.stringify(
          Object.assign(
            getIssue,
            { token: getCredentials },
            { createClient: createClient },
            { createContract: createContract },
            { registerClient: registerClient },
            { getApiKey: getApiKey },
            { commentIssue: commentIssue },
            { closeIssue: closeIssue },
          ),
        ),
      );
    } catch (error) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }
}
