import { IsNonEmptyString } from '@core/validator';
import { IsOptional, IsUrl, Matches } from 'class-validator';
import { Schema } from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';

export class PrjDocumentKey extends Document {
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
  },

  name: String,

  url: String,
});
