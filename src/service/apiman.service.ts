import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApimanService {
  private readonly logger = new Logger(ApimanService.name);

  private readonly APIMAN_API: any =
    this.configService.get<string>('http.apis.apiman');

  private HEADERS = {};

  constructor(private configService: ConfigService, private http: HttpService) {
    this.HEADERS = {
      Authorization: '',
      'Content-Type': 'application/json;charset=UTF-8',
    };
  }

  async createClient(token, partner): Promise<any> {
    try {
      this.logger.log(`::${ApimanService.name}.createClient::Init`);

      const client = await this.http
        .post(
          `${this.APIMAN_API['baseUrl']}/organizations/stp/clients`,
          {
            initialVersion: '1.0',
            name: partner,
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json;charset=UTF-8',
            },
          },
        )
        .toPromise();
      if (Number(String(client?.status)[0]) !== 2) {
        return { status: client?.status, error: client.data };
      }
      if (client?.status === 409) {
        return { status: client.status, error: 'Client Alredy Exists' };
      }

      this.logger.log(`::${ApimanService.name}.createClient::End`);

      return {
        status: client.status,
        message: `Client ${partner} Created Sucessfull`,
      };
    } catch (error) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }
  async createContract(token, api, partner): Promise<any> {
    try {
      this.logger.log(`::${ApimanService.name}.createContract::Init`);

      const contract = await this.http
        .post(
          `${this.APIMAN_API['baseUrl']}/organizations/stp/clients/${partner}/versions/1.0/contracts`,

          {
            apiOrgId: 'stp',
            apiId: api,
            apiVersion: 'v1',
            planId: 'plan_credenciados',
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json;charset=UTF-8',
            },
          },
        )
        .toPromise();

      if (Number(String(contract?.status)[0]) !== 2) {
        return { status: contract.status, error: contract.data };
      }

      this.logger.log(`::${ApimanService.name}.createContract::End`);

      return {
        status: contract.status,
        message: `Contract Created for ${api} and ${partner}  Sucessfull`,
      };
    } catch (error) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }
  async registerClient(token, api, partner): Promise<any> {
    try {
      this.logger.log(`::${ApimanService.name}.registerClient::Init`);

      const register = await this.http
        .post(
          `${this.APIMAN_API['baseUrl']}/actions`,
          {
            type: 'registerClient',
            entityId: partner,
            organizationId: 'stp',
            entityVersion: '1.0',
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json;charset=UTF-8',
            },
          },
        )
        .toPromise();

      if (Number(String(register?.status)[0]) !== 2) {
        return { status: register?.status, error: register.data };
      }

      this.logger.log(`::${ApimanService.name}.resgisterClient::End`);

      return {
        status: register.status,
        message: `Client Registed for ${api} and ${partner}  Sucessfull`,
      };
    } catch (error) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }
  async getApiKey(token, api, partner): Promise<any> {
    try {
      this.logger.log(`::${ApimanService.name}.getApiKey::Init`);

      const apiKeyData = await this.http
        .get(
          `${this.APIMAN_API['baseUrl']}/organizations/stp/clients/${partner}/versions/1.0`,

          { headers: { Authorization: token } },
        )
        .toPromise();
      if (Number(String(apiKeyData?.status)[0]) !== 2) {
        return { status: apiKeyData.status, error: apiKeyData.data };
      }

      // this.logger.log(`::getIssue::Result [ ${JSON.stringify(apiKey.data)}].`);

      const { apikey } = apiKeyData?.data;

      this.logger.log(`::${ApimanService.name}.getApiKey::End`);

      return {
        apikey,
      };
    } catch (error) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }
}
