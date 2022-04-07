import { IsNonEmptyString } from '@core/validator';
import { IsOptional, IsUrl, Matches } from 'class-validator';
import { Schema } from 'dynamoose';

export class PrjDocumentKey {
  @IsNonEmptyString()
  @Matches(/^PRJ#/)
  id: string;

  @IsNonEmptyString()
  @Matches(/^PRJ#|^PKG#/)
  type: string;
}

export class PrjDocument extends PrjDocumentKey {
  @IsNonEmptyString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}

export const PrjSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  type: {
    type: String,
    rangeKey: true,
    index: {
      name: 'PkgGSI',
      global: true,
      rangeKey: 'id',
    },
  },

  name: String,

  url: String,
});
