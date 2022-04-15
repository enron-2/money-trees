import { IsNonEmptyString } from '@core/validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, instanceToPlain } from 'class-transformer';
import { Equals, IsUrl, Matches } from 'class-validator';
import { BaseEntity, MainTableDoc, PlainEntity } from './entity';
import { EntityType, KeyPrefix } from './enums';

const prjKeyRegex = new RegExp(`^${KeyPrefix.Project}#`);

export class ProjectEntity extends BaseEntity {
  @Equals(EntityType.Project)
  type: EntityType.Project;

  @IsNonEmptyString()
  @Expose()
  @ApiProperty()
  name: string;

  @IsUrl()
  @Expose()
  @ApiProperty()
  url: string;

  @Matches(prjKeyRegex)
  @Expose()
  @ApiProperty()
  get id(): string {
    return this.pk;
  }

  @Matches(prjKeyRegex)
  get pk(): string {
    return `${KeyPrefix.Project}#${this.name}`;
  }

  @Matches(prjKeyRegex)
  get sk(): string {
    return this.pk;
  }

  public toPlain() {
    return instanceToPlain(this, {
      excludeExtraneousValues: true,
    }) as PlainEntity<ProjectEntity>;
  }

  static fromDocument(plain: Partial<MainTableDoc>) {
    return BaseEntity._fromDocument(plain, ProjectEntity);
  }
}
