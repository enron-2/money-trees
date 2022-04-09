import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import * as tablenames from '@schemas/tablenames';
import { PkgVulnDocument, PkgVulnDocumentKey } from '@schemas/tables';
import { CreateVulnInput, UpdateVulnInput } from './vulns.dto';
import { AttributeType, normalizeAttributes } from '@core/utils';
import { VulnEntity } from '@schemas/entities';
import { plainToInstance } from 'class-transformer';
import { PackageDto, VulnDto } from '../dto';

type PkgVulnModel = Model<PkgVulnDocument, PkgVulnDocumentKey, 'id' | 'type'>;

@Injectable()
export class VulnsService {
  constructor(
    @InjectModel(tablenames.PackageVuln)
    private readonly pkgVuln: PkgVulnModel
  ) {}

  // TODO: how should you remove duplicates? and how to paginate?
  // I can find all, but pagination prolly sux
  // Since we would need both PKG and VLN
  // async findAll() {
  //   throw new NotImplementedException();
  // }

  async findOne(id: string, attrs?: AttributeType<unknown>) {
    const [vuln] = await this.pkgVuln
      .query()
      .using('VulnGSI')
      .where('type')
      .eq(id)
      .limit(1)
      .attributes(normalizeAttributes(attrs ?? VulnEntity))
      .exec();
    if (!vuln) throw new NotFoundException(`ID: ${id} not found`);
    return plainToInstance(
      VulnDto,
      { ...vuln, id: vuln.type },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * Get list of packages affected by the vuln
   */
  async packagesAffected(id: string, limit = 10, lastKey?: string) {
    const queryBuilder = this.pkgVuln
      .query()
      .using('VulnGSI')
      .where('type')
      .eq(id)
      .limit(limit)
      .attributes(['id']);
    if (lastKey) {
      queryBuilder.startAt({
        id: lastKey,
        type: id,
      });
    }
    const pkgIds = await queryBuilder.exec();
    const resolvedPkgs = await this.pkgVuln.batchGet(
      pkgIds.map((p) => ({
        id: p.id,
        type: p.id,
      }))
    );
    return plainToInstance(PackageDto, resolvedPkgs);
  }

  /**
   * Create new vulnerability
   * Also associate given packageIds to the new vulnerability
   */
  async create(input: CreateVulnInput) {
    const { packageIds, ...vulnProperties } = input;
    const resolvedPkgs = await this.pkgVuln.batchGet(
      packageIds.map((p) => ({
        id: p,
        type: p,
      }))
    );
    for (const id of packageIds) {
      const found = resolvedPkgs.find((pkg) => pkg.id === id);
      if (!found) {
        throw new NotFoundException(`Package with ID: ${id} not found`);
      }
    }
    const vulnEncodedSeverity = String.fromCodePoint(input.severity + 32);
    const vulnId = `VLN#${vulnEncodedSeverity}#${input.name}`;
    const { unprocessedItems } = await this.pkgVuln.batchPut(
      resolvedPkgs.map((pkg) => ({
        id: pkg.id,
        type: vulnId,
        ...vulnProperties,
      }))
    );
    if (unprocessedItems.length > 0) {
      throw new InternalServerErrorException(
        `BatchPut failed with ${unprocessedItems.length} items unprocessed`
      );
    }
    return { ...input, id: vulnId };
  }

  /**
   * Update a Vulnerability
   * Does not change package association
   */
  async update(id: string, input: UpdateVulnInput) {
    const oldVuln = await this.findOne(id);
    if (!oldVuln) throw new NotFoundException();
    delete oldVuln.id;

    const pkgIds = await this.pkgVuln
      .query()
      .using('VulnGSI')
      .where('type')
      .eq(id)
      .attributes(['id'])
      .exec();

    const updatedVuln: Omit<VulnDto, 'id'> = {
      ...oldVuln,
      ...plainToInstance(
        UpdateVulnInput,
        { ...input },
        { exposeUnsetFields: false }
      ),
    };

    const vulnId = input.severity
      ? `VLN#${String.fromCodePoint(updatedVuln.severity + 32)}#${
          updatedVuln.name
        }`
      : id;

    if (input.severity) {
      await this.pkgVuln.batchDelete(
        pkgIds.map((pkg) => ({
          id: pkg.id,
          type: id,
        }))
      );
    }

    await this.pkgVuln.batchPut(
      pkgIds.map((pkg) => ({
        id: pkg.id,
        type: vulnId,
        ...updatedVuln,
      }))
    );

    return plainToInstance(VulnDto, { ...updatedVuln, id: vulnId });
  }

  async linkToPkg(pkgId: string, vulnId: string) {
    const vuln = await this.findOne(vulnId);
    if (!vuln) throw new NotFoundException();
    const alreadyExists = await this.pkgVuln.get({
      id: pkgId,
      type: vuln.id,
    });
    if (alreadyExists) throw new ConflictException('Vuln already exists');
    return this.pkgVuln.create({
      id: pkgId,
      type: vuln.id,
      name: vuln.name,
      description: vuln.description,
      severity: vuln.severity,
    });
  }

  async unlinkFromPkg(pkgId: string, vulnId: string) {
    const existing = await this.pkgVuln.get({
      id: pkgId,
      type: vulnId,
    });
    if (!existing) throw new NotFoundException();
    await this.pkgVuln.delete({
      id: pkgId,
      type: vulnId,
    });
    return existing;
  }

  /**
   * Delete vuln from database
   * Updates all packages affected (unlinking)
   */
  async delete(id: string) {
    const pkgsToModify = await this.pkgVuln
      .query()
      .using('VulnGSI')
      .where('type')
      .eq(id)
      .exec();
    if (pkgsToModify.length === 0) throw new NotFoundException();
    const vulnToDelete = await this.pkgVuln.get({
      type: id,
      id: pkgsToModify[0].id,
    });
    const { unprocessedItems } = await this.pkgVuln.batchDelete(
      pkgsToModify.map((pkg) => ({
        id: pkg.id,
        type: id,
      }))
    );
    if (unprocessedItems.length > 0)
      throw new InternalServerErrorException(
        `Failed to delete ${unprocessedItems.length} items`
      );
    return plainToInstance(VulnDto, vulnToDelete);
  }
}
