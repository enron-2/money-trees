import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { VulnDto } from '../dto';

export class CreateVulnInput extends OmitType(VulnDto, ['id']) {
  @ApiProperty()
  @Matches(/^PKG#/, { each: true })
  @Expose()
  packageIds: string[];
}

export class UpdateVulnInput extends PartialType(
  OmitType(CreateVulnInput, ['packageIds', 'severity'])
) {
  @Transform(({ value }) => value && Number(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Expose()
  @ApiProperty()
  severity?: number;
}
