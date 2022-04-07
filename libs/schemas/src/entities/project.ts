import { IsNonEmptyString } from '@core/validator';
import { Expose } from 'class-transformer';
import { IsUrl, Matches } from 'class-validator';

export class ProjectEntity {
  @IsNonEmptyString()
  @Matches(/^PRJ#/)
  @Expose()
  id: string;

  @IsNonEmptyString()
  @Matches(/^PRJ#|^PKG#/)
  @Expose()
  type: string;

  @IsNonEmptyString()
  @Expose()
  name: string;

  @IsUrl()
  @Expose()
  url: string;
}
