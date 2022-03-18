import { isBase64Hash, isNonEmptyString } from '@core/validator';
import { isURL } from 'class-validator';
import { Model } from 'dynamoose/dist/Model';
import { Schema } from 'dynamoose/dist/Schema';
import { v4 as uuid } from 'uuid';
import { Vulnerability } from './vulnerabilities';

const requiredString = {
  type: String,
  required: true,
  validate: isNonEmptyString,
};

export const createPackageSchema = (vulnModel: Model): Schema =>
  new Schema({
    id: {
      type: String,
      default: uuid,
      set: (_, old) => old ?? uuid(),
      required: true,
      hashKey: true,
    },
    name: requiredString,
    version: requiredString,
    url: { ...requiredString, validate: isURL },
    checksum: {
      type: String,
      required: true,
      index: { name: 'checksumIndex', global: true },
      validate: isBase64Hash,
    },
    vulns: {
      type: Array,
      schema: [vulnModel as any],
    },
    createdAt: { type: Date, required: true },
  });

export interface PackageKey {
  id: string;
}

export interface Package extends PackageKey {
  name: string;
  version: string;
  url: string;
  checksum: string;
  vulns?: Array<Vulnerability>;
  createdAt: Date;
}
