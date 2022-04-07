import { IsNonEmptyString } from '@core/validator';
import { Expose } from 'class-transformer';
import { IsInt, Matches, Max, Min } from 'class-validator';

export class VulnEntity {
  @IsNonEmptyString()
  @Matches(/^PKG#/)
  @Expose()
  id: string;

  @IsNonEmptyString()
  @Matches(/^VLN#/)
  @Expose()
  type: string;

  /**
   * CVE goes here
   */
  @IsNonEmptyString()
  @Expose()
  name: string;

  @IsNonEmptyString()
  @Expose()
  description: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @Expose()
  severity: number;
}
