import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { PackageEntity, ProjectEntity, VulnEntity } from '@schemas/entities';
import { Expose, Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

const omitOptions = ['sk', 'pk', 'type', 'keys', 'toPlain'] as const;

export class PaginationDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Transform((param) => Number(param.value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^PKG#|^PRJ#|^VLN#/)
  lastKey?: string;
}

export class WorstSeverityDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @Transform((param) => Number(param.value))
  @ApiProperty()
  severity: number;
}

export class VulnDto extends OmitType(VulnEntity, [...omitOptions, 'ulid']) {}

export class PackageDto extends OmitType(PackageEntity, omitOptions) {
  @Expose()
  @ApiProperty({ type: WorstSeverityDto })
  @Type(() => WorstSeverityDto)
  worstSeverity?: WorstSeverityDto;
}

export class PackageDetailDto extends PackageDto {
  @Expose()
  @ApiPropertyOptional({ type: [VulnDto] })
  @Type(() => VulnDto)
  vulns?: Array<VulnDto>;
}

export class ProjectDto extends OmitType(ProjectEntity, omitOptions) {
  @Expose()
  @ApiPropertyOptional({ type: WorstSeverityDto })
  @Type(() => WorstSeverityDto)
  worstSeverity?: WorstSeverityDto;
}

export class ProjectDetailDto extends ProjectDto {
  @Expose()
  @ApiPropertyOptional({ type: [PackageDto] })
  @Type(() => PackageDto)
  packages?: Array<PackageDto>;
}
