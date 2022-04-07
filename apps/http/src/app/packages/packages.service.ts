import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PrjDocument,
  PrjDocumentKey,
  PkgVulnDocument,
  PkgVulnDocumentKey,
} from '@schemas/tables';
import { AttributeType, normalizeAttributes } from '@core/utils';
import * as tablenames from '@schemas/tablenames';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { PackageDetailDto, PackageDto, ProjectDto, VulnDto } from '../dto';
import { SortOrder } from 'dynamoose/dist/General';
import { VulnEntity } from '@schemas/entities';
import { plainToInstance } from 'class-transformer';

type PkgVulnModel = Model<PkgVulnDocument, PkgVulnDocumentKey, 'id' | 'type'>;
type PrjModel = Model<PrjDocument, PrjDocumentKey, 'id' | 'type'>;

@Injectable()
export class PackagesService {
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
    const scanner = this.pkgVuln.scan();
    scanner.where('id').beginsWith('PKG#');
    scanner.and().where('type').beginsWith('PKG#');
    if (lastKey) {
      scanner.startAt({ id: lastKey, type: lastKey });
    }

    scanner.attributes(
      attrs ? normalizeAttributes(attrs) : normalizeAttributes(PackageDto)
    );

    for (const [k, v] of Object.entries(query)) {
      if (!v) continue;
      if (typeof v === 'string') scanner.and().where(k).contains(v);
      else scanner.and().where(k).eq(v);
    }

    if (Object.values(query).filter((v) => !!v).length > 0) {
      const res = await scanner.exec();
      return res.slice(0, limit) as PackageDto[];
    } else {
      return scanner.limit(limit).exec() as Promise<PackageDto[]>;
    }
  }

  async findOne(id: string, attrs?: AttributeType<unknown>) {
    return this.pkgVuln.get(
      {
        id,
        type: id,
      },
      {
        return: 'document',
        attributes: attrs
          ? normalizeAttributes(attrs)
          : normalizeAttributes(PackageDto),
      }
    ) as Promise<PackageDto>;
  }

  async findOneWithVulns(
    id: string,
    lastKey?: string,
    sort?: SortOrder,
    limit = 10
  ) {
    const pkg = await this.pkgVuln.get({ id, type: id });
    if (!pkg) throw new NotFoundException();
    const queryBuilder = this.pkgVuln
      .query()
      .where('severity')
      .exists()
      .and()
      .where('id')
      .eq(id)
      .attributes(normalizeAttributes(VulnEntity));
    if (lastKey) {
      queryBuilder.startAt({ id, type: lastKey });
    }
    if (sort) {
      queryBuilder.sort(sort);
    }

    // Skip the 'PKG' entry
    if (!sort || sort === SortOrder.ascending) {
      queryBuilder.limit(limit + 1);
    } else {
      queryBuilder.limit(limit);
    }

    const vulns = await queryBuilder.exec();
    const pkgEntity = plainToInstance(PackageDetailDto, pkg);
    pkgEntity.vulns = plainToInstance(VulnDto, vulns);
    return pkgEntity;
  }

  async findProjectConsumingPackage(
    packageId: string,
    lastKey?: string,
    sort?: SortOrder,
    limit = 10
  ) {
    const pkgExists = await this.findOne(packageId, ['id']);
    if (!pkgExists) throw new NotFoundException();
    const prjQuery = this.prj
      .query()
      .using('PkgGSI')
      .where('type')
      .eq(packageId)
      .attributes(['id'])
      .limit(limit);
    if (lastKey) prjQuery.startAt({ type: packageId, id: lastKey });
    if (sort) prjQuery.sort(sort);
    const prjIds = await prjQuery.exec();
    const resolvedProjects = await this.prj.batchGet(
      prjIds.map((prj) => ({
        id: prj.id,
        type: prj.id,
      }))
    );
    return plainToInstance(ProjectDto, resolvedProjects);
  }
}
