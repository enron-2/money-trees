import {
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Model } from 'nestjs-dynamoose';

export abstract class QueryService<Data, Key> {
  constructor(private readonly repository: Model<Data, Key>) {}

  findAll(limit = 10, lastKey?: string) {
    let query = this.repository.scan().limit(limit);
    if (lastKey) {
      query = query.startAt({ id: lastKey });
    }
    return query.exec();
  }

  async findOne(id: string) {
    const res = await this.repository
      .query()
      .where('id')
      .eq(id)
      .limit(1)
      .exec();
    return res?.[0];
  }
}

class PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform((param) => +param.value)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  lastKey?: string;
}

export abstract class QueryController {
  constructor(private readonly service: QueryService<unknown, unknown>) {}

  @Get()
  findAll(
    @Query()
    { limit, lastKey }: PaginationDto,
  ) {
    return this.service.findAll(limit, lastKey);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const res = await this.service.findOne(id);
    if (!res) throw new NotFoundException();
    return res;
  }
}
