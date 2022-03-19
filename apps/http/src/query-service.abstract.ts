import { Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';
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

class PaginationDto {
  @IsOptional()
  @Transform((param) => +param.value)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsUUID()
  lastKey?: string;
}

export abstract class QueryController {
  constructor(private readonly service: QueryService) {}

  @Get()
  findAll(
    @Query()
    { limit, lastKey }: PaginationDto,
  ) {
    return this.service.findAll(limit, lastKey);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }
}
