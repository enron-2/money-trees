import { IsNonEmptyString } from '@core/validator';
import { Expose } from 'class-transformer';
import { IsInt, Matches, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VulnEntity {
  @IsNonEmptyString()
  @Matches(/^PKG#/)
  @Expose()
  @ApiProperty()
  id: string;

  @IsNonEmptyString()
  @Matches(/^VLN#/)
  @Expose()
  @ApiProperty()
  type: string;

  /**
   * CVE goes here
   */
  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  name: string;

  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  description: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @Expose()
  @ApiProperty()
  severity: number;
}
