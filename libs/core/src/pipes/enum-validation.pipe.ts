import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { isDefined, isEnum } from 'class-validator';

export type EnumValidationPipeOptions = {
  optional: boolean;
};

export class EnumValidationPipe
  implements PipeTransform<string, string | undefined>
{
  constructor(
    private readonly enumData: any,
    private readonly options?: EnumValidationPipeOptions
  ) {}
  transform(value: string, metadata: ArgumentMetadata) {
    if (this.options?.optional && !isDefined(value)) return undefined;
    if (!isDefined(value))
      throw new BadRequestException(
        `Value is not defined for ${metadata.type}`
      );
    if (!isEnum(value, this.enumData))
      throw new BadRequestException(`${value} is invalid`);
    return this.enumData[value];
  }
}
