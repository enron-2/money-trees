import { IsNonEmptyString } from '@core/validator';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
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
    const severity = String.fromCodePoint(this.severity);
    return `${KeyPrefix.Vuln}#${severity}#${this.name}`;
  }

  @Matches(vulnKeyRegex)
  get sk(): string {
    return this.pk;
  }

  public toPlain() {
    return instanceToPlain(this, {
      excludeExtraneousValues: true,
    }) as PlainEntity<VulnEntity>;
  }

  static fromDocument(plain: Partial<MainTableDoc>) {
    return BaseEntity._fromDocument(plain, VulnEntity);
  }
}
