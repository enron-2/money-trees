import { Injectable, NotFoundException } from '@nestjs/common';
import { AttributeType, normalizeAttributes } from '@core/utils';
import {
  EntityType,
  MainTableDoc,
  MainTableKey,
  PackageEntity,
  ProjectEntity,
} from '@schemas/entities';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { SortOrder } from 'dynamoose/dist/General';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel('MainTable')
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
      .using('TypeGSI')
      .where('type')
      .eq(EntityType.Project);

    if (lastKey) {
      queryBuilder.startAt({
        type: EntityType.Project,
        pk: lastKey,
      });
    }

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
      return res?.slice(0, limit)?.map((doc) => ({
        ...ProjectEntity.fromDocument(doc).toPlain(),
        worstSeverity: doc?.worstVuln?.severity,
      }));
    }
    const res = await queryBuilder.limit(limit).exec();
    return res?.map((doc) => ({
      ...ProjectEntity.fromDocument(doc).toPlain(),
      worstSeverity: doc?.worstVuln?.severity,
    }));
  }

  async findOne(id: string, attrs?: AttributeType<unknown>) {
    const prj = attrs
      ? await this.model.get(
          {
            pk: id,
            sk: id,
          },
          {
            return: 'document',
            attributes: normalizeAttributes(attrs),
          }
        )
      : await this.model.get({ pk: id, sk: id });
    if (!prj) throw new NotFoundException();
    return {
      ...ProjectEntity.fromDocument(prj).toPlain(),
      worstSeverity: prj?.worstVuln?.severity,
    };
  }

  async findRelatedPackages(id: string, lastKey?: string, limit = 10) {
    const queryBuilder = this.model.query().where('pk').eq(id).limit(limit);
    if (lastKey) queryBuilder.startAt({ pk: id, sk: lastKey });
    const res = await queryBuilder.exec();
    const withMaxVuln = async (id: string) => {
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
    };
    const final = await Promise.all(res.map((pkg) => withMaxVuln(pkg.sk)));
    return final;
  }
}
