import { plainToInstance } from 'class-transformer';

export class MainTableKey {
  pk: string;
  sk: string;
}

export class MainTableDoc extends MainTableKey {
  type?: string;
  name?: string;
  url?: string;
  version?: string;
  checksum?: string;
  description?: string;
  severity?: string;
}

export abstract class BaseEntity {
  abstract get pk(): string;
  abstract get sk(): string;

  public abstract toPlain(): unknown;

  public keys(): MainTableKey {
    return plainToInstance(MainTableKey, { pk: this.pk, sk: this.sk });
  }
}

export enum EntityType {
  PACKAGE = 'Package',
  PROJECT = 'Project',
  VULN = 'VULN',
}

export enum KeyPrefix {
  PACKAGE = 'PKG',
  PROJECT = 'PRJ',
  VULN = 'VLN',
}

type Overlap<T, U> = { [K in keyof T & keyof U]: U[K] };
type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Select properties needed to construct class T
 * Make fields in U optional
 */
export type EntityConstructor<
  T,
  U extends keyof MainTableDoc | void = void
> = U extends keyof Overlap<T, MainTableDoc>
  ? Optional<Overlap<T, MainTableDoc>, U>
  : Overlap<T, MainTableDoc>;
