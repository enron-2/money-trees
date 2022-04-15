import {
  BadRequestException,
  Injectable,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';
import { capitalize } from 'lodash';

@Injectable()
export class RegexPipe implements PipeTransform<string, string> {
  constructor(private readonly pattern: RegExp) {}
  transform(value: string, metadata: ArgumentMetadata) {
    if (!this.pattern.test(value))
      throw new BadRequestException(
        `${metadata?.type ? capitalize(metadata.type) : 'Unknown'} of ${
          metadata.data ?? 'unknown'
        } does not match ${this.pattern}`
      );
    return value;
  }
}
