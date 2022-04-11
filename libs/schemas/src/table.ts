import { Schema } from 'dynamoose';

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
      name: 'InverseGSI',
      rangeKey: 'pk',
    },
  },
  type: {
    type: String,
    index: {
      global: true,
      name: 'TypeGSI',
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
});
