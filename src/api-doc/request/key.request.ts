import { ApiProperty, ApiQuery } from '@nestjs/swagger';

export class KeyRequest {
  @ApiProperty()
  api?: string;
  @ApiProperty()
  clientName?: string;
}
