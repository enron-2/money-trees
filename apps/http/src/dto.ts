import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Package } from '@schemas/packages';
import { Project } from '@schemas/projects';
import { Vulnerability } from '@schemas/vulnerabilities';
import { Type } from 'class-transformer';

export class VulnDto implements Vulnerability {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  cve?: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  severity: number;
}

export class PackageDetailDto implements Package {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  checksum: string;

  @ApiPropertyOptional({ type: [VulnDto] })
  @Type(() => VulnDto)
  vulns?: VulnDto[];

  @ApiProperty({ type: Date })
  @Type(() => Date)
  createdAt: Date;
}
export class PackageDto extends OmitType(PackageDetailDto, ['vulns']) {}

export class ProjectDetailDto implements Omit<Project, 'packages'> {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional({ type: [PackageDto] })
  @Type(() => PackageDto)
  packages?: PackageDto[];
}
export class ProjectDto extends OmitType(ProjectDetailDto, ['packages']) {}
