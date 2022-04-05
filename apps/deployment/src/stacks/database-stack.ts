import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { IGrantable } from '@aws-cdk/aws-iam';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import * as table from '@schemas/tablenames';

export interface ITables {
  [table.Project]: Table;
  [table.Package]: Table;
  [table.Vuln]: Table;
}

export class DatabaseStack extends Stack {
  Tables: ITables = { Vuln: undefined, Package: undefined, Project: undefined };
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    for (const t of Object.keys(table)) {
      this.Tables[t] = new Table(this, t, {
        partitionKey: { name: 'id', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
      });
    }
    this.Tables.Package.addGlobalSecondaryIndex({
      indexName: 'checksumIndex',
      partitionKey: {
        name: 'checksum',
        type: AttributeType.STRING,
      },
    });
    this.Tables.Project.addGlobalSecondaryIndex({
      indexName: 'urlIndex',
      partitionKey: {
        name: 'url',
        type: AttributeType.STRING,
      },
    });
  }

  get Package() {
    return this.Tables.Package;
  }

  get Project() {
    return this.Tables.Project;
  }

  get Vuln() {
    return this.Tables.Vuln;
  }

  grantRead(entity: IGrantable, resource: keyof ITables) {
    this.Tables[resource].grantReadData(entity);
  }

  grantWrite(entity: IGrantable, resource: keyof ITables) {
    this.Tables[resource].grantWriteData(entity);
  }

  grantReadAll(entity: IGrantable) {
    Object.keys(this.Tables).forEach((resource) =>
      this.grantRead(entity, resource as keyof ITables)
    );
  }

  grantWriteAll(entity: IGrantable) {
    Object.keys(this.Tables).forEach((resource) =>
      this.grantWrite(entity, resource as keyof ITables)
    );
  }
}
