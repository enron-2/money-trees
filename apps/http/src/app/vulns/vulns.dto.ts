import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Matches } from 'class-validator';
import { VulnDto } from '../dto';

export class CreateVulnInput extends OmitType(VulnDto, ['id']) {
  @ApiProperty()
  @Matches(/^PKG#/, { each: true })
  @Expose()
  packageIds: string[];
}

export class UpdateVulnInput extends PartialType(
  OmitType(CreateVulnInput, ['packageIds'])
) {}
