import { v4 as uuid } from 'uuid';
import { Schema } from 'dynamoose/dist/Schema';
import { isNonEmptyString } from '@core/validator';
import { isInt } from 'class-validator';

export const createVulnerabilitySchema = (): Schema =>
  new Schema({
    id: {
      type: String,
      default: uuid,
      set: (newVal, oldVal) => (!!newVal && !!oldVal ? oldVal : newVal),
      required: true,
      hashKey: true,
    },
    cve: { type: String, validate: isNonEmptyString },
    title: { type: String, required: true, validate: isNonEmptyString },
    description: { type: String, validate: isNonEmptyString },
    severity: { type: Number, required: true, validate: isInt },
  });

export interface VulnerabilityKey {
  id: string;
}

export interface Vulnerability extends VulnerabilityKey {
  cve?: string;
  title: string;
  description?: string;
  severity: number;
}
