import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
// import { URLSearchParams } from 'url';
// import { url } from 'inspector';

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);

  private readonly KEYCLOAK_API: any =
    this.configService.get<string>('http.apis.keycloak');

  private KEYCLOAK = {};

  constructor(private configService: ConfigService, private http: HttpService) {
    this.KEYCLOAK = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async getCredentials(): Promise<any> {
    try {
      this.logger.log(`::${KeycloakService.name}.getCredentials::Init`);

      const params = new URLSearchParams();
      params.append('client_id', this.KEYCLOAK_API['clientId']);
      params.append('grant_type', this.KEYCLOAK_API['grantType']);
      params.append('client_secret', this.KEYCLOAK_API['clientSecret']);
      params.append('username', this.KEYCLOAK_API['username']);
      params.append('password', this.KEYCLOAK_API['password']);
      // const params = `${this.KEYCLOAK_API['clientId']}+${this.KEYCLOAK_API['grantType']}+${this.KEYCLOAK_API['clientSecret']}+${this.KEYCLOAK_API['username']}+${this.KEYCLOAK_API['password']}`;
      // const url = `${this.KEYCLOAK_API['baseUrl']}&client_id=${this.KEYCLOAK_API['clientId']}&grant_type=${this.KEYCLOAK_API['grantType']}&client_secret=3b52e00c-8f15-43d3-ae50-558bf9475a2d&username=${this.KEYCLOAK_API['username']}&password=${this.KEYCLOAK_API['password']}`;
      // const params =
      //   'client_id=apiman&grant_type=password&client_secret=3b52e00c-8f15-43d3-ae50-558bf9475a2d&username=admin&password=admin123%21';
      const token = await this.http
        .post(`${this.KEYCLOAK_API['baseUrl']}`, params, {
          headers: this.KEYCLOAK,
        })
        .toPromise();

      if (Number(String(token?.status)[0]) !== 2) {
        return token;
      }
      this.logger.log(`::${KeycloakService.name}.getCredentials::End`);

      return 'Bearer ' + token.data.access_token;
    } catch (error) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }
}
