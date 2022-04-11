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
      return res
        ?.slice(0, limit)
        ?.map((doc) => ProjectEntity.fromDocument(doc));
    }
    const res = await queryBuilder.limit(limit).exec();
    return res?.map((doc) => ProjectEntity.fromDocument(doc));
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
    return ProjectEntity.fromDocument(prj);
  }

  async findRelatedPackages(id: string, lastKey?: string, limit = 10) {
    const queryBuilder = this.model.query().where('pk').eq(id).limit(limit);
    if (lastKey) queryBuilder.startAt({ pk: id, sk: lastKey });
    const res = await queryBuilder.exec();
    const pkgs = await this.model.batchGet(
      res.map((r) => ({
        pk: r.sk,
        sk: r.sk,
      }))
    );
    return pkgs.map((pkg) => PackageEntity.fromDocument(pkg));
  }
}
