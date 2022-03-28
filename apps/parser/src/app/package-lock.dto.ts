import { Expose, Type } from 'class-transformer';
import { IsBase64Hash } from '@core/validator';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PkgMeta {
  /** Actual version used */
  @IsString()
  version: string;

  /** URL of the package */
  @IsString()
  resolved: string;

  /** Checksum */
  @IsBase64Hash()
  integrity: string;

  @IsOptional()
  dev: boolean;

  // Other properties that we don't care about
  [x: string]: unknown;
}

export class PackageLock {
  @IsString()
  name: string;

  @IsString()
  version: string;

  @IsInt()
  lockfileVersion: number;

  @IsBoolean()
  requires: boolean;

  @Type(() => PkgMeta)
  @ValidateNested({ each: true })
  @Expose({ name: 'dependencies' }) // INFO: idk, package lock be weird
  packages: Map<string, PkgMeta>;
}
