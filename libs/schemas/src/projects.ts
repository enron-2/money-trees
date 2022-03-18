import { v4 as uuid } from 'uuid';
import { Schema } from 'dynamoose/dist/Schema';
import { isNonEmptyString } from '@core/validator';
import { isURL } from 'class-validator';
import { Model } from 'dynamoose/dist/Model';
import { Package } from './packages';

export function createProjectSchema(packageModel: Model): Schema {
  return new Schema({
    id: {
      type: String,
      default: uuid,
      set: (_, old) => old ?? uuid(),
      required: true,
      hashKey: true,
    },
    name: { type: String, required: true, validate: isNonEmptyString },
    url: { type: String, required: true, validate: isURL },
    packages: {
      type: Array,
      schema: [packageModel as any],
    },
  });
}

export interface ProjectKey {
  id: string;
}

export interface Project extends ProjectKey {
  name: string;
  url: string;
  packages?: Array<Package>;
}
