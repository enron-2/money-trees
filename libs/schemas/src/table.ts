import { Schema } from 'dynamoose';
import { GSI } from '@constants';

export const MainSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
    index: {
      global: true,
      name: GSI.Inverse,
      rangeKey: 'pk',
    },
  },
  type: {
    type: String,
    index: {
      global: true,
      name: GSI.Type,
      rangeKey: 'pk',
    },
  },

  // All entities
  name: {
    type: String,
  },

  // PKG & PRJ
  url: {
    type: String,
  },
  worstVuln: {
    type: Object,
    schema: {
      id: String,
      severity: Number,
    },
  },

  // PKG
  version: {
    type: String,
  },
  checksum: {
    type: String,
  },

  // VLN
  description: {
    type: String,
  },
  severity: {
    type: Number,
  },
  ulid: {
    type: String,
  },
});
