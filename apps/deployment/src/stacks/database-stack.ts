import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { IGrantable } from '@aws-cdk/aws-iam';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
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
        tableName: t,
      });
    }
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
