import { IsBase64Hash, IsNonEmptyString } from '@core/validator';
import { Equals, IsUrl, Matches, validateSync } from 'class-validator';
import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  EntityConstructor,
  EntityType,
  KeyPrefix,
  MainTableOverlap,
} from './entity';

const pkgKeyRegex = new RegExp(`^${KeyPrefix.Package}#`);

export type PlainPackageEntity = Omit<
  MainTableOverlap<PackageEntity>,
  'pk' | 'sk' | 'type'
> & { id: string };

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

  public toPlain(): PlainPackageEntity {
    return instanceToPlain(this, {
      excludeExtraneousValues: true,
    }) as PlainPackageEntity;
  }

  static fromDocument(plainObj: EntityConstructor<PackageEntity, 'pk' | 'sk'>) {
    const created = plainToInstance(PackageEntity, plainObj);
    if (plainObj.pk && created.pk !== plainObj.pk) {
      throw Error('pk supplied mismatch');
    }
    if (plainObj.sk && created.sk !== plainObj.sk) {
      throw Error('sk supplied mismatch');
    }
    const validationErrors = validateSync(created);
    if (validationErrors.length > 0)
      throw new Error(`Failed to validate:\n${validationErrors}`);
    return created;
  }
}
