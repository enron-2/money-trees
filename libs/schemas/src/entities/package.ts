import { IsBase64Hash, IsNonEmptyString } from '@core/validator';
import { IsUrl, Matches } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PackageEntity {
  @IsNonEmptyString()
  @Matches(/^PKG#/)
  @Expose()
  @ApiProperty()
  id: string;

  @IsNonEmptyString()
  @Matches(/^PKG#/)
  @Expose()
  @ApiProperty()
  type: string;

  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  name: string;

  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  version: string;

  @IsUrl()
  @Expose()
  @ApiProperty()
  url: string;

  @IsBase64Hash()
  @Expose()
  @ApiProperty()
  checksum: string;
}
