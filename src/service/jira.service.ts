import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);

  private readonly JIRA_API: any =
    this.configService.get<string>('http.apis.jira');

  private HEADERS = {};

  constructor(private configService: ConfigService, private http: HttpService) {
    const auth = new Buffer(
      this.JIRA_API['username'] + ':' + this.JIRA_API['password'],
    ).toString('base64');

    this.HEADERS = {
      Authorization: `Basic ${auth}`,
    };
  }
  async getIssue(): Promise<any> {
    try {
      this.logger.log(`::${JiraService.name}.getIssue::Init`);

      const issue = await this.http
        .post(
          `${this.JIRA_API['baseUrl']}/rest/api/2/search`,
          {
            jql: ` project = URB AND status = Aberto AND 'Epic Link' =${this.JIRA_API['epicKey']}`,
            startAt: 0,
            maxResults: 1,
            fields: ['id', 'key', 'summary'],
          },
          {
            headers: this.HEADERS,
          },
        )
        .toPromise();

      if (Number(String(issue?.status)[0]) !== 2) {
        return { status: issue.status, error: issue.data };
      }
      if (
        !issue?.data?.issues ||
        !Array.isArray(issue?.data?.issues) ||
        !issue?.data?.issues.length
      ) {
        throw new HttpException('Dont Have Tasks Open', HttpStatus.NOT_FOUND);
      }
      // this.logger.log(`::getIssue::Result [ ${JSON.stringify(issue.data)}].`);

      const { id, key, fields } = issue?.data?.issues[0];

      this.logger.log(`::${JiraService.name}.getIssue::End`);

      const summaryArr = fields.summary.split(' - ');

      if (summaryArr.length > 3 || summaryArr[0] !== 'API_KEY_APIMAN') {
        throw new HttpException(
          `Payload Invalido.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        id,
        key,
        api: summaryArr[1].toLowerCase(),
        partner: summaryArr[2].toLowerCase(),
      };
    } catch (error) {
      this.logger.log(error);
      throw new HttpException(`${error.message}`, error.status);
    }
  }

  async commentIssue(taskId, apiKey): Promise<any> {
    try {
      this.logger.log(`::${JiraService.name}.commentIssue::Init`);

      const comment = await this.http
        .post(
          `${this.JIRA_API['baseUrl']}/rest/api/2/issue/${taskId}/comment`,
          {
            body: `API_KEY_APIMAN: ${apiKey}`,
          },
          {
            headers: this.HEADERS,
          },
        )
        .toPromise();
      if (Number(String(comment?.status)[0]) !== 2) {
        return { status: comment.status, error: comment.data };
      }

      this.logger.log(`::${JiraService.name}.commentIssue::End`);

      return {
        status: comment.status,
        message: `API_KEY_APIMAN Commented Inner task:${taskId}`,
      };
    } catch (error) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }

  async closeIssue(taskId): Promise<any> {
    try {
      this.logger.log(`::${JiraService.name}.closeIssue::Init`);

      const close = await this.http
        .post(
          `${this.JIRA_API['baseUrl']}/rest/api/2/issue/${taskId}/transitions?expand=transitions.fields`,
          {
            transition: { id: '81' },
          },
          {
            headers: this.HEADERS,
          },
        )
        .toPromise();
      if (Number(String(close?.status)[0]) !== 2) {
        return { status: close.status, error: close.data };
      }

      this.logger.log(`::${JiraService.name}.closeIssue::End`);

      return {
        status: close.status,
        message: `Task: ${taskId} Was Closed In Jira`,
      };
    } catch (error) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }
}
