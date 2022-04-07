import { IsNonEmptyString } from '@core/validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { PackageEntity, ProjectEntity, VulnEntity } from '@schemas/entities';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

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
  @Matches(/^PKG#|^PRJ#|^VLN#/)
  lastKey?: string;
}

export class VulnDto extends OmitType(VulnEntity, ['id', 'type']) {
  @IsNonEmptyString()
  @Matches(/^VLN#/)
  @Expose()
  id: string;
}

export class PackageDto extends OmitType(PackageEntity, ['type']) {}

export class PackageDetailDto extends PackageDto {
  @Expose()
  @ApiPropertyOptional({ type: [VulnDto] })
  @Type(() => VulnDto)
  vulns?: Array<VulnDto>;
}

export class ProjectDto extends OmitType(ProjectEntity, ['type']) {}

export class ProjectDetailDto extends ProjectDto {
  @Expose()
  @ApiPropertyOptional({ type: [PackageDto] })
  @Type(() => PackageDto)
  packages: Array<PackageDto>;
}
