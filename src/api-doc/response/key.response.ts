import { ApiProperty } from '@nestjs/swagger';

export class KeyResponse {
  @ApiProperty()
  apiKey?: string;

}

