import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Model, TransactionSupport } from 'nestjs-dynamoose';

export abstract class QueryService<Data, Key> extends TransactionSupport {
  constructor(private readonly repository: Model<Data, Key>) {
    super();
  }

  findAll(limit = 10, lastKey?: string) {
    let query = this.repository.scan().limit(limit);
    if (lastKey) {
      query = query.startAt({ id: lastKey });
    }
    return query.exec();
  }

  async findOne(id: string) {
    const [res] = await this.repository
      .query()
      .where('id')
      .eq(id)
      .limit(1)
      .exec();
    return res;
  }
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 10 })
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
