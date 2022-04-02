import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ClassConstructor,
  plainToInstance,
  Transform,
} from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Model, TransactionSupport } from 'nestjs-dynamoose';

type AttributeType<T> =
  | Record<keyof T, unknown>
  | Array<keyof T>
  | ClassConstructor<T>;

export abstract class QueryService<Data, Key> extends TransactionSupport {
  constructor(private readonly repository: Model<Data, Key>) {
    super();
  }

  normalizeAttributes(attributes: AttributeType<Data>): string[] {
    if (Array.isArray(attributes)) return attributes as string[];
    if (typeof attributes === 'function')
      return Object.keys(
        plainToInstance(attributes, {}, { exposeUnsetFields: true })
      );
    return Object.keys(attributes);
  }

  async findAll(
    limit = 10,
    lastKey?: string,
    query?: Record<string, any>,
    attributes?: AttributeType<Data>
  ) {
    let scanner = this.repository.scan();
    if (attributes) {
      scanner = scanner.attributes(this.normalizeAttributes(attributes));
    }
    for (const [k, v] of Object.entries(query)) {
      if (!v) continue;
      scanner =
        typeof v === 'string'
          ? scanner.and().where(k).contains(v)
          : scanner.and().where(k).eq(v);
    }
    if (lastKey) {
      scanner = scanner.startAt({ id: lastKey });
    }
    if (Object.values(query).filter((v) => !!v).length > 0) {
      const res = await scanner.exec();
      return res.slice(0, limit);
    } else {
      return scanner.limit(limit).exec();
    }
  }

  async findOne(id: string, attributes?: AttributeType<Data>) {
    let query = this.repository.query();
    if (attributes) {
      query = query.attributes(this.normalizeAttributes(attributes));
    }
    const [res] = await query.where('id').eq(id).exec();
    return res;
  }
}

export class PaginationDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Transform((param) => +param.value)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  lastKey?: string;
}
