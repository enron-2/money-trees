import { Injectable, NotFoundException } from '@nestjs/common';
import { AttributeType, normalizeAttributes } from '@core/utils';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { PackageDetailDto } from '../dto';
import { SortOrder } from 'dynamoose/dist/General';
import {
  EntityType,
  MainTableDoc,
  MainTableKey,
  PackageEntity,
  ProjectEntity,
  VulnEntity,
} from '@schemas/entities';
import { plainToInstance } from 'class-transformer';
import { TableName, GSI } from '@constants';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(TableName)
    private readonly model: Model<MainTableDoc, MainTableKey>
  ) {}

  async findAll(
    limit = 10,
    lastKey?: string,
    query?: Record<string, any>,
    attrs?: AttributeType<unknown>
  ) {
    const queryBuilder = this.model
      .query()
      .using(GSI.Type)
      .where('type')
      .eq(EntityType.Package);

    if (lastKey)
      queryBuilder.startAt({
        type: EntityType.Package,
        sk: lastKey,
        pk: lastKey,
      });

    if (attrs) {
      queryBuilder.attributes(normalizeAttributes(attrs));
    }

    for (const [k, v] of Object.entries(query)) {
      if (!v) continue;
      if (typeof v === 'string') queryBuilder.and().where(k).contains(v);
      else queryBuilder.and().where(k).eq(v);
    }

    const hasQuery =
      !!query && Object.values(query)?.filter((v) => !!v).length > 0;
    if (hasQuery) {
      const res = await queryBuilder.exec();
      return res
        ?.slice(0, limit)
        ?.map((doc) => PackageEntity.fromDocument(doc));
    }
    const res = await queryBuilder.limit(limit).exec();
    return res?.map((doc) => PackageEntity.fromDocument(doc));
  }

  async findOneWithMaxVuln(id: string) {
    const pkg = await this.model.get({ pk: id, sk: id });
    const pkgEntity = PackageEntity.fromDocument(pkg);
    const [maxVlnPrimaryKey] = await this.model
      .query()
      .sort(SortOrder.descending)
      .where('pk')
      .eq(id)
      .limit(1)
      .and()
      .attribute('name')
      .not()
      .exists()
      .exec();
    if (!maxVlnPrimaryKey) return pkgEntity.toPlain();
    const vln = await this.model.get({
      pk: maxVlnPrimaryKey.sk,
      sk: maxVlnPrimaryKey.sk,
    });
    return { ...pkgEntity.toPlain(), worstSeverity: vln.severity };
  }

  async findOne(id: string, attrs?: AttributeType<unknown>) {
    const pkg = attrs
      ? await this.model.get(
          { pk: id, sk: id },
          {
            return: 'document',
            attributes: normalizeAttributes(attrs),
          }
        )
      : await this.model.get({ pk: id, sk: id });
    if (!pkg) throw new NotFoundException();
    return PackageEntity.fromDocument(pkg);
  }

  async findRelatedVulns(
    id: string,
    lastKey?: string,
    sort?: SortOrder,
    limit = 10
  ) {
    const pkg = await this.findOne(id);
    if (!pkg) throw new NotFoundException();
    const queryBuilder = this.model
      .query()
      .where('pk')
      .eq(id)
      .and()
      .where('name')
      .not()
      .exists();

    if (lastKey) {
      queryBuilder.startAt({ pk: id, sk: lastKey });
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

    const vulnIds = await queryBuilder.exec();
    const vulns =
      vulnIds.length > 0
        ? await this.model.batchGet(
            vulnIds.map((vln) => ({
              pk: vln.sk,
              sk: vln.sk,
            }))
          )
        : undefined;

    const pkgEntity = plainToInstance(PackageDetailDto, pkg);
    pkgEntity.vulns =
      vulns && vulns.length > 0
        ? vulns.map((vln) => VulnEntity.fromDocument(vln).toPlain())
        : undefined;
    return pkgEntity;
  }

  async findProjectConsumingPackage(
    packageId: string,
    lastKey?: string,
    limit = 10
  ) {
    const pkgExists = await this.findOne(packageId);
    if (!pkgExists) throw new NotFoundException();

    const prjQuery = this.model
      .query()
      .using(GSI.Inverse)
      .where('sk')
      .eq(packageId)
      .limit(limit);

    if (lastKey) {
      prjQuery.startAt({ sk: packageId, pk: lastKey });
    } else {
      prjQuery.startAt({ sk: packageId, pk: packageId });
    }

    const prjs = await prjQuery.exec();
    if (prjs.length <= 0) return [];
    const resolvedProjects = await this.model.batchGet(
      prjs.map((prj) => ({
        pk: prj.pk,
        sk: prj.pk,
      }))
    );
    return resolvedProjects.map((doc) => ProjectEntity.fromDocument(doc));
  }
}
