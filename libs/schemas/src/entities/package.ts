import { IsBase64Hash, IsNonEmptyString } from '@core/validator';
import { Equals, IsUrl, Matches } from 'class-validator';
import { Expose, instanceToPlain } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, MainTableDoc, PlainEntity } from './entity';
import { EntityType, KeyPrefix } from './enums';

const pkgKeyRegex = new RegExp(`^${KeyPrefix.Package}#`);

export class PackageEntity extends BaseEntity {
  @Equals(EntityType.Package)
  type: EntityType.Package;

  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  name: string;

  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  version: string;

  @IsBase64Hash()
  @Expose()
  @ApiProperty()
  checksum: string;

  @IsUrl()
  @Expose()
  @ApiProperty()
  url: string;

  @Matches(pkgKeyRegex)
  @Expose()
  @ApiProperty()
  get id(): string {
    return this.pk;
  }

  @Matches(pkgKeyRegex)
  get pk(): string {
    return `${KeyPrefix.Package}#${this.name}#${this.version}`;
  }

  @Matches(pkgKeyRegex)
  get sk(): string {
    return this.pk;
  }

  public toPlain() {
    return instanceToPlain(this, {
      excludeExtraneousValues: true,
    }) as PlainEntity<PackageEntity>;
  }

  static fromDocument(plain: Partial<MainTableDoc>) {
    return BaseEntity._fromDocument(plain, PackageEntity);
  }
}
