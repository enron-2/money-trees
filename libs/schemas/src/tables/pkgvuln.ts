import { Schema } from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { IsBase64Hash, IsNonEmptyString } from '@core/validator';
import { IsInt, IsOptional, IsUrl, Matches, Max, Min } from 'class-validator';

export class PkgVulnDocumentKey extends Document {
  @IsNonEmptyString()
  @Matches(/^PKG#/)
  id: string;

  @IsNonEmptyString()
  @Matches(/^PKG#|^VLN#/)
  type: string;
}

export class PkgVulnDocument extends PkgVulnDocumentKey {
  @IsNonEmptyString()
  name: string;

  @IsNonEmptyString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  severity?: number;

  @IsNonEmptyString()
  @IsOptional()
  version?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsBase64Hash()
  @IsOptional()
  checksum?: string;
}

export const PkgVulnSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  type: {
    type: String,
    rangeKey: true,
    index: {
      name: 'VulnGSI',
      global: true,
      rangeKey: 'id',
      project: ['name', 'description', 'severity'],
    },
  },

  /**
   * PKG + VLN
   *
   * In VLN this is the CVE name
   * In PKG this is the package's name
   */
  name: String,

  /** VLN */
  description: String,

  /** VLN */
  severity: Number,

  /** PKG */
  version: String,

  /** PKG */
  url: String,

  /** PKG */
  checksum: String,
});
