import { IsBase64Hash, IsNonEmptyString } from '@core/validator';
import { IsUrl, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class PackageEntity {
  @IsNonEmptyString()
  @Matches(/^PKG#/)
  @Expose()
  id: string;

  @IsNonEmptyString()
  @Matches(/^PKG#/)
  @Expose()
  type: string;

  @IsNonEmptyString()
  @Expose()
  name: string;

  @IsNonEmptyString()
  @Expose()
  version: string;

  @IsUrl()
  @Expose()
  url: string;

  @IsBase64Hash()
  @Expose()
  checksum: string;
}
