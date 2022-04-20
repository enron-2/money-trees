import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { CreateVulnInput, UpdateVulnInput } from './vulns.dto';
import { AttributeType, normalizeAttributes } from '@core/utils';
import {
  EntityType,
  MainTableDoc,
  MainTableKey,
  VulnEntity,
} from '@schemas/entities';
import { plainToInstance } from 'class-transformer';
import { PackageDto } from '../dto';
import { SortOrder } from 'dynamoose/dist/General';
import { GSI, TableName } from '@constants';
import { ulid } from 'ulid';

@Injectable()
export class VulnsService {
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
      .eq(EntityType.Vuln);

    if (lastKey)
      queryBuilder.startAt({
        type: EntityType.Vuln,
        pk: lastKey,
        sk: lastKey,
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
      return res?.slice(0, limit)?.map((doc) => VulnEntity.fromDocument(doc));
    }
    const res = await queryBuilder.limit(limit).exec();
    return res?.map((doc) => VulnEntity.fromDocument(doc));
  }

  async findOne(id: string, attrs?: AttributeType<unknown>) {
    const vuln = attrs
      ? await this.model.get(
          { pk: id, sk: id },
          { return: 'document', attributes: normalizeAttributes(attrs) }
        )
      : await this.model.get({ pk: id, sk: id });
    if (!vuln) throw new NotFoundException();
    return VulnEntity.fromDocument(vuln);
  }

  /**
   * Get list of packages affected by the vuln
   */
  async packagesAffected(id: string, limit = 10, lastKey?: string) {
    const queryBuilder = this.model
      .query()
      .using(GSI.Inverse)
      .where('sk')
      .eq(id)
      .limit(limit)
      .attributes(['pk'])
      .and()
      .attribute('name')
      .not()
      .exists();

    if (lastKey) {
      queryBuilder.startAt({
        sk: id,
        pk: lastKey,
      });
    }

    const pkgs = await queryBuilder.exec();
    const resolvedPkgs = await this.model.batchGet(
      pkgs.map((p) => ({
        pk: p.pk,
        sk: p.pk,
      }))
    );
    return plainToInstance(PackageDto, resolvedPkgs);
  }

  /**
   * Create new vulnerability
   * Also associate given packageIds to the new vulnerability
   */
  async create(input: CreateVulnInput) {
    const { packageIds, ...vulnCreate } = input;

    let vulnEntity = VulnEntity.fromDocument({
      ...vulnCreate,
      ulid: ulid(),
      type: EntityType.Vuln,
    });

    const vuln = await this.model.create({
      ...vulnEntity.keys(),
      ...vulnCreate,
      ulid: vulnEntity.ulid,
      type: EntityType.Vuln,
    });

    vulnEntity = VulnEntity.fromDocument(vuln);

    const resolvedPkgs = await this.model.batchGet(
      packageIds.map((id) => ({ pk: id, sk: id }))
    );

    for (const id of packageIds) {
      const found = resolvedPkgs.find((pkg) => pkg.pk === id);
      if (!found) throw new NotFoundException(`Package ID: ${id} not found`);
    }

    const { unprocessedItems } = await this.model.batchPut(
      resolvedPkgs.map((pkg) => ({ pk: pkg.pk, sk: vulnEntity.sk }))
    );
    if (unprocessedItems.length > 0) {
      throw new InternalServerErrorException(
        `Unprocessed items:\n${unprocessedItems}`
      );
    }

    const queryGen = (pk: string) =>
      this.model
        .query()
        .using(GSI.Inverse)
        .where('sk')
        .eq(pk)
        .and()
        .where('name')
        .not()
        .exists()
        .attributes(['pk'])
        .exec();
    const queryResults = await Promise.all(
      resolvedPkgs.map((p) => queryGen(p.pk))
    );

    const affectedProjects = await this.model.batchGet(
      [...new Set(queryResults.flat().map((prj) => prj.pk))].map((prj) => ({
        pk: prj,
        sk: prj,
      }))
    );
    await Promise.all(
      affectedProjects
        .filter(
          (prj) =>
            !prj.worstVuln || prj.worstVuln.severity < vulnEntity.severity
        )
        .map((prj) =>
          this.model.update(
            { pk: prj.pk, sk: prj.sk },
            {
              $SET: {
                worstVuln: {
                  severity: vulnEntity.severity,
                  id: vulnEntity.id,
                },
              },
            }
          )
        )
    );

    return vulnEntity;
  }

  /**
   * Update a Vulnerability
   * Does not change package association
   */
  async update(id: string, input: UpdateVulnInput) {
    const vuln = await this.model.get({ pk: id, sk: id });
    if (!input.severity) {
      const { pk, sk, ...rest } = vuln;
      return this.model
        .update({ pk, sk }, { ...rest, ...input })
        .then((vln) => VulnEntity.fromDocument(vln));
    }
    const updatedEntity = VulnEntity.fromDocument({ ...vuln, ...input });
    const pkgsAffected = await this.model
      .query()
      .using(GSI.Inverse)
      .where('sk')
      .eq(id)
      .attributes(['pk'])
      .and()
      .attribute('name')
      .not()
      .exists()
      .all(100)
      .exec();
    await this.delete(id);
    return await this.create({
      ...updatedEntity.toPlain(),
      packageIds: pkgsAffected.map((pkg) => pkg.pk),
    });
  }

  async linkToPkg(pkgId: string, vulnId: string) {
    // get current package's max vuln
    const [maxVulnPk] = await this.model
      .query()
      .sort(SortOrder.descending)
      .where('pk')
      .eq(pkgId)
      .and()
      .attribute('name')
      .not()
      .exists()
      .limit(1)
      .exec();

    // create link PKG.pk + VLN.pk
    await this.model.create({ pk: pkgId, sk: vulnId });

    const maxVuln = await this.model.get({
      pk: maxVulnPk?.pk ?? vulnId,
      sk: maxVulnPk?.pk ?? vulnId,
    });

    // proceed if current PKG.max_vuln < VLN.severity
    const vulnDoc = await this.model.get({ pk: vulnId, sk: vulnId });
    if (maxVuln.severity >= vulnDoc.severity && maxVuln.pk !== vulnDoc.pk)
      return;

    // get affected projects
    const affectedPrjIds = await this.model
      .query()
      .using(GSI.Inverse)
      .where('sk')
      .eq(pkgId)
      .startAt({ pk: pkgId, sk: pkgId })
      .exec();
    const affectedPrs = await this.model.batchGet(
      affectedPrjIds.map((prj) => ({
        pk: prj.pk,
        sk: prj.pk,
      }))
    );
    // Get projects with lower worstVuln
    const prjsWithLowerVuln = affectedPrs.filter(
      (prj) => prj.worstVuln?.severity ?? -1 < vulnDoc.severity
    );
    // Set worstVuln to new vuln
    await this.model.batchPut(
      prjsWithLowerVuln.map((prj) => ({
        ...prj,
        worstVuln: {
          id: vulnId,
          severity: vulnDoc.severity,
        },
      }))
    );
  }

  async unlinkFromPkg(pkgId: string, vulnId: string) {
    // delete link
    await this.model.delete({ pk: pkgId, sk: vulnId });

    // get affected projects
    const affectedPrjIds = await this.model
      .query()
      .using(GSI.Inverse)
      .where('sk')
      .eq(pkgId)
      .startAt({ pk: pkgId, sk: pkgId })
      .exec();
    const affectedPrs = await this.model.batchGet(
      affectedPrjIds.map((prj) => ({ pk: prj.pk, sk: prj.pk }))
    );
    const prjsWithSameVulnId = affectedPrs.filter(
      (prj) => prj.worstVuln?.id === vulnId
    );
    if (prjsWithSameVulnId.length === 0) return;
    // get next highest vuln in project for each project
    //    put new highest vuln in worstVuln attr
    for (const prj of prjsWithSameVulnId) {
      const pkgInPrjIds = await this.model
        .query()
        .where('pk')
        .eq(prj.pk)
        .sort(SortOrder.descending)
        .startAt({ pk: prj.pk, sk: prj.pk })
        .exec();
      const maxVulnsInPrj = (
        await Promise.all(
          pkgInPrjIds.map(async (pkg) => {
            const [maxVulnPk] = await this.model
              .query()
              .sort(SortOrder.descending)
              .where('pk')
              .eq(pkg.sk)
              .and()
              .attribute('name')
              .not()
              .exists()
              .limit(1)
              .exec();
            return maxVulnPk
              ? this.model.get({ pk: maxVulnPk.sk, sk: maxVulnPk.sk })
              : undefined;
          })
        )
      ).filter((e) => !!e);
      if (maxVulnsInPrj.length === 0) {
        await this.model.update(
          { pk: prj.pk, sk: prj.pk },
          {
            $REMOVE: {
              worstVuln: null,
            },
          }
        );
        continue;
      }
      const trueMax = maxVulnsInPrj.reduce((prev, curr) =>
        prev?.severity ?? -1 > curr?.severity ?? -1 ? prev : curr
      );
      if (!trueMax) continue;
      await this.model.update(
        {
          pk: prj.pk,
          sk: prj.pk,
        },
        {
          $SET: {
            worstVuln: {
              id: trueMax.pk,
              severity: trueMax.severity,
            },
          },
        }
      );
    }
  }

  /**
   * Delete vuln from database
   * Updates all packages affected (unlinking)
   */
  async delete(id: string) {
    const pkgToModify = await this.model
      .query()
      .using(GSI.Inverse)
      .where('sk')
      .eq(id)
      .and()
      .attribute('type')
      .not()
      .exists()
      .attributes(['pk'])
      .exec();

    const toDelete = await this.model
      .get({ pk: id, sk: id })
      .then((vln) => VulnEntity.fromDocument(vln));

    const queryGen = (pk: string) =>
      this.model
        .query()
        .using(GSI.Inverse)
        .where('sk')
        .eq(pk)
        .and()
        .where('name')
        .not()
        .exists()
        .attributes(['pk'])
        .exec();
    const queryResults = await Promise.all(
      pkgToModify.map((pkg) => queryGen(pkg.pk))
    );
    const affectedProjects = queryResults.flat().map((prj) => prj.pk);
    for (const prjId of affectedProjects) {
      const pkgsInPrj = await this.model
        .query()
        .attributes(['sk'])
        .where('pk')
        .eq(prjId)
        .and()
        .attribute('name')
        .not()
        .exists()
        .all(100)
        .exec();
      const _vulns = await Promise.all(
        pkgsInPrj.map(async (pkg) => {
          const res = await this.model
            .query()
            .where('pk')
            .eq(pkg.sk)
            .and()
            .attribute('name')
            .not()
            .exists()
            .sort(SortOrder.descending)
            .limit(1)
            .exec();
          if (res.length <= 0) return;
          return this.model.get({ pk: res[0].sk, sk: res[0].sk });
        })
      );
      const vulns = _vulns
        .filter((v) => !!v)
        .filter((v) => v.pk !== toDelete.pk);
      if (vulns.length <= 0) {
        // no max vuln
        await this.model.update(
          { pk: prjId, sk: prjId },
          { $REMOVE: { worstVuln: null } }
        );
        continue;
      }
      const max = vulns.reduce((prev, curr) =>
        prev?.severity ?? -1 > curr?.severity ?? -1 ? prev : curr
      );
      await this.model.update(
        { pk: prjId, sk: prjId },
        {
          $SET: {
            worstVuln: {
              id: max.pk,
              severity: max.severity,
            },
          },
        }
      );
    }

    await this.model.delete({ pk: id, sk: id });
    const { unprocessedItems } = await this.model.batchDelete(
      pkgToModify.map((pkg) => ({ pk: pkg.pk, sk: id }))
    );
    if (unprocessedItems.length > 0) {
      throw new InternalServerErrorException(
        `Unprocessed Items:\n${unprocessedItems}`
      );
    }

    return toDelete;
  }
}
