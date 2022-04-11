import { ClassConstructor, Expose, plainToInstance } from 'class-transformer';
import { IsEnum, validateSync } from 'class-validator';
import { EntityType } from './enums';

export class MainTableKey {
  pk: string;
  sk: string;
}

export class MainTableDoc extends MainTableKey {
  type?: string;
  name?: string;
  url?: string;
  version?: string;
  worstVuln?: {
    id: string;
    severity: number;
  };
  checksum?: string;
  description?: string;
  severity?: number;
  ulid?: string;
}

export abstract class BaseEntity {
  abstract get pk(): string;
  abstract get sk(): string;

  abstract get id(): string;

  public abstract toPlain(): PlainEntity<unknown>;

  @Expose({ toClassOnly: true })
  @IsEnum(EntityType)
  type: EntityType;

  public keys(): MainTableKey {
    return plainToInstance(MainTableKey, { pk: this.pk, sk: this.sk });
  }

  protected static _fromDocument<T extends MainTableDoc>(
    plain: Partial<MainTableDoc>,
    kls: ClassConstructor<T>
  ) {
    const created = plainToInstance(kls, plain, {
      excludeExtraneousValues: true,
    });
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

type Overlap<T, U> = { [K in keyof T & keyof U]: U[K] };
type MainTableOverlap<T> = Overlap<MainTableDoc, T>;
export type PlainEntity<T> = Omit<MainTableOverlap<T>, 'pk' | 'sk' | 'type'> & {
  id: string;
};
