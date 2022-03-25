import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { VulnDto } from '../dto';

export class CreateVulnInput extends OmitType(VulnDto, ['id']) {
  @ApiProperty()
  @IsUUID('4', { each: true })
  packageIds: string[];
}

export class UpdateVulnInput extends PartialType(
  OmitType(CreateVulnInput, ['packageIds']),
) {}
