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
  Package = 'Package',
  Project = 'Project',
  Vuln = 'Vuln',
}

export enum KeyPrefix {
  Package = 'PKG',
  Project = 'PRJ',
  Vuln = 'VLN',
}

export type Overlap<T, U> = { [K in keyof T & keyof U]: U[K] };
export type Optional<T extends object, K extends keyof T = keyof T> = Omit<
  T,
  K
> &
  Partial<Pick<T, K>>;

/** Makes EntityConstructor easier to read */
export type MainTableOverlap<T> = Overlap<MainTableDoc, T>;

/**
 * Select properties needed to construct class T
 * Make fields in U optional
 */
export type EntityConstructor<
  T,
  U extends keyof MainTableOverlap<T> = keyof MainTableOverlap<T>
> = Optional<MainTableOverlap<T>, U>;
