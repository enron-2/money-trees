import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import * as tablenames from '@schemas/tablenames';
import {
  PkgVulnDocument,
  PkgVulnDocumentKey,
  PrjDocument,
  PrjDocumentKey,
} from '@schemas/tables';
import { AttributeType, normalizeAttributes } from '@core/utils';
import { PackageDto, ProjectDetailDto, ProjectDto } from '../dto';
import { plainToInstance } from 'class-transformer';

type PkgVulnModel = Model<PkgVulnDocument, PkgVulnDocumentKey, 'id' | 'type'>;
type PrjModel = Model<PrjDocument, PrjDocumentKey, 'id' | 'type'>;

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(tablenames.PackageVuln)
    private readonly pkgVuln: PkgVulnModel,
    @InjectModel(tablenames.Project)
    private readonly prj: PrjModel
  ) {}

  async findAll(
    limit = 10,
    lastKey?: string,
    query?: Record<string, any>,
    attrs?: AttributeType<unknown>
  ) {
    const scanner = this.prj.scan();
    scanner.where('type').beginsWith('PRJ#');
    if (lastKey) {
      scanner.startAt({ id: lastKey, type: lastKey });
    }

    scanner.attributes(
      attrs ? normalizeAttributes(attrs) : normalizeAttributes(ProjectDto)
    );

    for (const [k, v] of Object.entries(query)) {
      if (!v) continue;
      if (typeof v === 'string') scanner.and().where(k).contains(v);
      else scanner.and().where(k).eq(v);
    }

    const res = await scanner.exec();
    return res.slice(0, limit) as ProjectDto[];
  }

  async findOne(id: string, attrs?: AttributeType<unknown>) {
    const prj = await this.prj.get(
      { id, type: id },
      {
        return: 'document',
        attributes: normalizeAttributes(attrs ?? ProjectDto),
      }
    );
    if (!prj) throw new NotFoundException();
    return prj;
  }

  async findOneWithPackages(id: string, lastKey?: string, limit = 10) {
    const prj = await this.findOne(id);
    const queryBuilder = this.prj.query().where('id').eq(prj.id).limit(limit);
    if (lastKey) queryBuilder.startAt({ id, type: lastKey });

    const pkgInPrjIds = await queryBuilder.exec();
    const resolvedPkgs = await this.pkgVuln.batchGet(
      pkgInPrjIds.map((pkg) => ({
        id: pkg.type,
        type: pkg.type,
      }))
    );
    const finalPrj = plainToInstance(ProjectDetailDto, prj);
    finalPrj.packages = plainToInstance(PackageDto, resolvedPkgs);
    return finalPrj;
  }
}
