import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';

@Injectable()
export class IdExistsPipe implements PipeTransform<string, Promise<string>> {
  constructor(
    @InjectModel('MainTable')
    private readonly model: Model<unknown, { pk: string; sk: string }>
  ) {}

  async transform(value: string): Promise<string> {
    const exists = await this.model.get({ pk: value, sk: value });
    if (!exists) throw new NotFoundException(`ID ${value} not found`);
    return value;
  }
}
