import { isBase64Hash, isNonEmptyString } from '@core/validator';
import { isURL } from 'class-validator';
import { Model } from 'dynamoose/dist/Model';
import { Schema } from 'dynamoose/dist/Schema';
import { v4 } from 'uuid';
import { Vulnerability } from './vulnerabilities';

const uuid = v4;

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
    maxVuln: vulnModel as any,
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
  maxVuln?: Vulnerability;
  createdAt: Date;
}
