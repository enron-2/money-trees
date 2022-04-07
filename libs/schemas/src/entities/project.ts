import { IsNonEmptyString } from '@core/validator';
import { Expose } from 'class-transformer';
import { IsUrl, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectEntity {
  @IsNonEmptyString()
  @Matches(/^PRJ#/)
  @Expose()
  @ApiProperty()
  id: string;

  @IsNonEmptyString()
  @Matches(/^PRJ#|^PKG#/)
  @Expose()
  @ApiProperty()
  type: string;

  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  name: string;

  @IsUrl()
  @Expose()
  @ApiProperty()
  url: string;
}
