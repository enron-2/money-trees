import { IsNonEmptyString } from '@core/validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Package } from '@schemas/packages';
import { Project } from '@schemas/projects';
import { Vulnerability } from '@schemas/vulnerabilities';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsPositive, IsUUID } from 'class-validator';

export class VulnDto implements Vulnerability {
  @Expose()
  @ApiProperty()
  @IsUUID()
  id: string;

  @Expose()
  @ApiPropertyOptional()
  @IsOptional()
  @IsNonEmptyString()
  cve?: string;

  @Expose()
  @ApiProperty()
  @IsNonEmptyString()
  title: string;

  @Expose()
  @ApiPropertyOptional()
  @IsOptional()
  @IsNonEmptyString()
  description?: string;

  @Expose()
  @ApiProperty()
  @IsPositive()
  severity: number;
}

export class PackageDetailDto implements Package {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  version: string;

  @Expose()
  @ApiProperty()
  url: string;

  @Expose()
  @ApiProperty()
  checksum: string;

  @Expose()
  @ApiPropertyOptional({ type: [VulnDto] })
  @Type(() => VulnDto)
  vulns?: VulnDto[];

  @Expose()
  @ApiProperty({ type: Date })
  @Type(() => Date)
  createdAt: Date;
}

export class PackageDto extends OmitType(PackageDetailDto, ['vulns']) {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  version: string;

  @Expose()
  @ApiProperty()
  url: string;

  @Expose()
  @ApiProperty()
  checksum: string;

  @Expose()
  @ApiProperty({ type: Date })
  @Type(() => Date)
  createdAt: Date;
}

export class ProjectDetailDto implements Omit<Project, 'packages'> {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  url: string;

  @Expose()
  @ApiPropertyOptional({ type: [PackageDto] })
  @Type(() => PackageDto)
  packages?: PackageDto[];
}

export class ProjectDto extends OmitType(ProjectDetailDto, ['packages']) {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  url: string;
}
