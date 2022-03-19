import { Model } from 'nestjs-dynamoose';

export abstract class QueryService {
  constructor(private readonly repository: Model<unknown, unknown>) {}

  findAll(limit = 10, lastKey?: string) {
    let query = this.repository.scan().limit(limit);
    if (lastKey) {
      query = query.startAt({ id: lastKey });
    }
    return query.exec();
  }

  findOne(id: string) {
    return this.repository.query().where('id').eq(id).exec();
  }
}
