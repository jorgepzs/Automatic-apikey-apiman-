// import {
//   Body,
//   HttpException,
//   HttpStatus,
//   Injectable,
//   Logger,
// } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { KeyRequest } from '../api-doc/request/key.request';
// import { HttpRequestService } from './http-request.service';
// import { KeyResponse } from '../api-doc/response/key.response';
// import { Cron, CronExpression } from '@nestjs/schedule';

// @Injectable()
// export class KeyService {
//   private readonly logger = new Logger(KeyService.name);

//   private readonly JIRA_API: any =
//     this.configService.get<string>('http.apis.jira');

//   private readonly KEYCLOAK_API: any =
//     this.configService.get<string>('http.apis.keycloak');

//   private readonly APIMAN_API: any =
//     this.configService.get<string>('http.apis.apiman');

//   private readonly JIRA_AUTH = new Buffer(
//     this.JIRA_API['username'] + ':' + this.JIRA_API['password'],
//   ).toString('base64');

//   private APIMAN = {};
//   private KEYCLOAK = {};
//   private JIRA = {};

//   constructor(private configService: ConfigService, private http: HttpService) {
//     this.JIRA = {
//       // Authorization: `Basic ${auth}`,
//     };
//     this.KEYCLOAK = {
//       // 'Content-Type': 'application/x-www-form-urlencoded',
//     };
//     this.APIMAN = {
//       Authorization: '  ',
//       'Content-Type': 'application/json;charset=UTF-8',
//     };
//   }

//   // @Cron(CronExpression.EVERY_5_SECONDS)
//   async cron(): Promise<any> {
//     try {
//       // const { api, clientName } = params;

//       this.logger.log(`::${KeyService.name}.main::Init`);

//       // Goal -> Get Issue on JIRA for generate API KEY in APIMAN
//       const getIssue = await this.getIssue();

//       // Goal -> Generate API KEY in APIMAN
//       const getCredentials = await this.getCredentials();
//       const createClient = await this.createClient(
//         getCredentials,
//         getIssue.partner,
//       );
//       const createContract = await this.createContract(
//         getCredentials,
//         getIssue.api,
//         getIssue.partner,
//       );
//       const registerClient = await this.registerClient(
//         getCredentials,
//         getIssue.api,
//         getIssue.partner,
//       );
//       const getApiKey = await this.getApiKey(
//         getCredentials,
//         getIssue.api,
//         getIssue.partner,
//       );

//       // Goal -> Comment in Issue the API KEY generated and close it
//       const commentIssue = await this.commentIssue(
//         getIssue.id,
//         getApiKey.apikey,
//       );
//       const closeIssue = await this.closeIssue(getIssue.id);

//       this.logger.log(`::${KeyService.name}.main::End`);

//       // return Object.assign(
//       //   getIssue,
//       //   { token: getCredentials },
//       //   { createClient: createClient },
//       //   { createContract: createContract },
//       //   { registerClient: registerClient },
//       //   { getApiKey: getApiKey },
//       //   { commentIssue: commentIssue },
//       //   { closeIssue: closeIssue },
//       // );
//       // return {
//       //   apiKey: '',
//       // };
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }

//   async getIssue(): Promise<any> {
//     try {
//       this.logger.log(`::${KeyService.name}.getIssue::Init`);

//       const { data: issue } = await this.http.post(
//         `${this.JIRA_API['baseUrl']}/rest/api/2/search`,
//         {
//           jql: "project = URB AND status = Aberto AND 'Epic Link' = URB-2506",
//           startAt: 0,
//           maxResults: 1,
//           fields: ['id', 'key', 'summary'],
//         },
//         {
//           headers: {
//             // Authorization: `Basic ${this.JIRA_AUTH}`,
//           },
//         },
//       );
//       if (Number(String(issue?.status)[0]) !== 2) {
//         return { status: issue.status, error: issue.data };
//       }
//       if (
//         !issue?.data?.issues ||
//         !Array.isArray(issue?.data?.issues) ||
//         !issue?.data?.issues.length
//       ) {
//         throw new HttpException('Dont Have Tasks Open', HttpStatus.NOT_FOUND);
//       }
//       // this.logger.log(`::getIssue::Result [ ${JSON.stringify(issue.data)}].`);

//       const { id, key, fields } = issue?.data?.issues[0];

//       this.logger.log(`::${KeyService.name}.getIssue::End`);

//       const summaryArr = fields.summary.split(' - ');

//       if (summaryArr.length > 3 || summaryArr[0] !== 'API_KEY_APIMAN') {
//         throw new HttpException(
//           `Payload Invalido.`,
//           HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//       }

//       return {
//         id,
//         key,
//         api: summaryArr[1].toLowerCase(),
//         partner: summaryArr[2].toLowerCase(),
//       };
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }

//   async getCredentials(): Promise<any> {
//     try {
//       this.logger.log(`::${KeyService.name}.getCredentials::Init`);

//       const params = new URLSearchParams();
//       params.append('client_id', this.KEYCLOAK_API['clientId']);
//       params.append('grant_type', this.KEYCLOAK_API['grantType']);
//       params.append('client_secret', this.KEYCLOAK_API['clientSecret']);
//       params.append('username', this.KEYCLOAK_API['username']);
//       params.append('password', this.KEYCLOAK_API['password']);

//       const token = await this.post(
//         'KEYCLOAK',
//         `${this.KEYCLOAK_API['baseUrl']}`,
//         params,
//       );

//       if (Number(String(token?.status)[0]) !== 2) {
//         return token.data;
//       }
//       this.logger.log(`::${KeyService.name}.getCredentials::End`);

//       return 'Bearer ' + token.data.access_token;
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }
//   async createClient(token, partner): Promise<any> {
//     try {
//       this.logger.log(`::${KeyService.name}.createClient::Init`);

//       const client = await this.postWithHeaders(
//         { Authorization: token },
//         `${this.APIMAN_API['baseUrl']}/organizations/stp/clients`,
//         {
//           initialVersion: '1.0',
//           name: partner,
//         },
//       );
//       if (client?.status === 409) {
//         return { status: client.status, error: client.data };
//       }

//       if (Number(String(client?.status)[0]) !== 2) {
//         return { status: client.status, error: client.data };
//       }

//       // this.logger.log(`::getIssue::Result [ ${JSON.stringify(client.data)}].`);

//       this.logger.log(`::${KeyService.name}.createClient::End`);

//       return {
//         status: client.status,
//         message: `Client ${partner} Created Sucessfull`,
//       };
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }
//   async createContract(token, api, partner): Promise<any> {
//     try {
//       this.logger.log(`::${KeyService.name}.createContract::Init`);

//       const contract = await this.postWithHeaders(
//         { Authorization: token },
//         `${this.APIMAN_API['baseUrl']}/organizations/stp/clients/${partner}/versions/1.0/contracts`,

//         {
//           apiOrgId: 'stp',
//           apiId: api,
//           apiVersion: 'v1',
//           planId: 'plan_credenciados',
//         },
//       );

//       if (Number(String(contract?.status)[0]) !== 2) {
//         return { status: contract.status, error: contract.data };
//       }

//       this.logger.log(`::${KeyService.name}.createContract::End`);

//       return {
//         status: contract.status,
//         message: `Contract Created for ${api} and ${partner}  Sucessfull`,
//       };
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }
//   async registerClient(token, api, partner): Promise<any> {
//     try {
//       this.logger.log(`::${KeyService.name}.registerClient::Init`);

//       const register = await this.postWithHeaders(
//         { Authorization: token },
//         `${this.APIMAN_API['baseUrl']}/actions`,
//         {
//           type: 'registerClient',
//           entityId: partner,
//           organizationId: 'stp',
//           entityVersion: '1.0',
//         },
//       );

//       if (Number(String(register?.status)[0]) !== 2) {
//         return { status: register.status, error: register.data };
//       }

//       this.logger.log(`::${KeyService.name}.resgisterClient::End`);

//       return {
//         status: register.status,
//         message: `Client Registed for ${api} and ${partner}  Sucessfull`,
//       };
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }
//   async getApiKey(token, api, partner): Promise<any> {
//     try {
//       this.logger.log(`::${KeyService.name}.getApiKey::Init`);

//       const apiKeyData = await this.getWithHeaders(
//         { Authorization: token },
//         `${this.APIMAN_API['baseUrl']}/organizations/stp/clients/${partner}/versions/1.0`,
//       );
//       if (Number(String(apiKeyData?.status)[0]) !== 2) {
//         return { status: apiKeyData.status, error: apiKeyData.data };
//       }

//       // this.logger.log(`::getIssue::Result [ ${JSON.stringify(apiKey.data)}].`);

//       const { apikey } = apiKeyData?.data;

//       this.logger.log(`::${KeyService.name}.getApiKey::End`);

//       return {
//         apikey,
//       };
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }
//   async commentIssue(taskId, apiKey): Promise<any> {
//     try {
//       this.logger.log(`::${KeyService.name}.commentIssue::Init`);

//       const comment = await this.post(
//         'JIRA',
//         `${this.JIRA_API['baseUrl']}/rest/api/2/issue/${taskId}/comment`,
//         {
//           body: `API_KEY_APIMAN: ${apiKey}`,
//         },
//       );
//       if (Number(String(comment?.status)[0]) !== 2) {
//         return { status: comment.status, error: comment.data };
//       }

//       this.logger.log(`::${KeyService.name}.commentIssue::End`);

//       return {
//         status: comment.status,
//         message: `API_KEY_APIMAN Commented Inner task:${taskId}`,
//       };
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }
//   async closeIssue(taskId): Promise<any> {
//     try {
//       this.logger.log(`::${KeyService.name}.closeIssue::Init`);

//       const close = await this.post(
//         'JIRA',
//         `${this.JIRA_API['baseUrl']}/rest/api/2/issue/${taskId}/transitions?expand=transitions.fields`,
//         {
//           transition: { id: '81' },
//         },
//       );
//       if (Number(String(close?.status)[0]) !== 2) {
//         return { status: close.status, error: close.data };
//       }

//       this.logger.log(`::${KeyService.name}.closeIssue::End`);

//       return {
//         status: close.status,
//         message: `Task: ${taskId} Was Closed In Jira`,
//       };
//     } catch (error) {
//       throw new HttpException(`${error.message}`, error.status);
//     }
//   }

//   async post(type, url, body): Promise<any> {
//     const response = await this.http
//       .post(url, body, {
//         headers: this[type],
//       })
//       .toPromise()
//       .catch((err) => {
//         if (err) {
//           throw new HttpException(`${err}`, 500);
//         }

//         throw new HttpException(
//           `Erro ao efetuar a chamada do servico [ ${err} ].`,
//           HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//       });
//     return response;
//   }

//   async postWithHeaders(headers, url, body): Promise<any> {
//     const response = await this.http
//       .post(url, body, {
//         headers,
//       })
//       .toPromise()
//       .catch((err) => {
//         if (err) {
//           throw new HttpException(`${err}`, 500);
//         }

//         throw new HttpException(
//           `Erro ao efetuar a chamada do servico [ ${err} ].`,
//           HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//       });
//     return response;
//   }

//   async getWithHeaders(headers, url): Promise<any> {
//     const response = await this.http
//       .get(url, {
//         headers,
//       })
//       .toPromise()
//       .catch((err) => {
//         if (err) {
//           throw new HttpException(`${err}`, 500);
//         }

//         throw new HttpException(
//           `Erro ao efetuar a chamada do servico [ ${err} ].`,
//           HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//       });
//     return response;
//   }
// }
