import { IsNonEmptyString } from '@core/validator';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, instanceToPlain, Transform } from 'class-transformer';
import { Equals, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { BaseEntity, MainTableDoc, PlainEntity } from './entity';
import { EntityType, KeyPrefix } from './enums';

const vulnKeyRegex = new RegExp(`^${KeyPrefix.Vuln}#`);

export class VulnEntity extends BaseEntity {
  @Equals(EntityType.Vuln)
  type: EntityType.Vuln;

  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  name: string;

  @IsNonEmptyString()
  @IsOptional()
  @Expose()
  @ApiPropertyOptional()
  description?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(10)
  @Expose()
  @ApiProperty()
  severity: number;

  @Matches(vulnKeyRegex)
  @Expose()
  @ApiProperty()
  get id(): string {
    return this.pk;
  }

  @Matches(vulnKeyRegex)
  get pk(): string {
    const severity = String.fromCodePoint(this.severity + 32);
    return `${KeyPrefix.Vuln}#${severity}#${this.ulid}`;
  }

  @Matches(vulnKeyRegex)
  get sk(): string {
    return this.pk;
  }

  @Expose({ toClassOnly: true })
  ulid: string;

  public toPlain(options: ClassTransformOptions = {}) {
    return instanceToPlain(this, {
      excludeExtraneousValues: true,
      ...options,
    }) as PlainEntity<VulnEntity>;
  }

  static fromDocument(plain: Partial<MainTableDoc>) {
    delete plain.pk;
    delete plain.sk;
    return BaseEntity._fromDocument(plain, VulnEntity);
  }
}
