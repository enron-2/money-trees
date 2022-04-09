import { IsNonEmptyString } from '@core/validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { Equals, IsUrl, Matches, validateSync } from 'class-validator';
import {
  BaseEntity,
  EntityConstructor,
  EntityType,
  KeyPrefix,
  MainTableOverlap,
} from './entity';

const prjKeyRegex = new RegExp(`^${KeyPrefix.Project}#`);

export type PlainProjectEntity = Omit<
  MainTableOverlap<ProjectEntity>,
  'pk' | 'sk' | 'type'
> & { id: string };

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

  public toPlain(): PlainProjectEntity {
    return instanceToPlain(this, {
      excludeExtraneousValues: true,
    }) as PlainProjectEntity;
  }

  static fromDocument(plain: EntityConstructor<ProjectEntity, 'pk' | 'sk'>) {
    const created = plainToInstance(ProjectEntity, plain);
    if (plain.pk && created.pk !== plain.pk) {
      throw Error('pk supplied mismatch');
    }
    if (plain.sk && created.sk !== plain.sk) {
      throw Error('sk supplied mismatch');
    }
    const validationErrors = validateSync(created);
    if (validationErrors.length > 0)
      throw new Error(`Failed to validate:\n${validationErrors}`);
    return created;
  }
}
