import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { IGrantable } from '@aws-cdk/aws-iam';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { GSI, TableName } from '@constants';

export class DatabaseStack extends Stack {
  table: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.table = new Table(this, `${id}${TableName}`, {
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    this.table.addGlobalSecondaryIndex({
      indexName: GSI.Inverse,
      partitionKey: {
        type: AttributeType.STRING,
        name: 'sk',
      },
      sortKey: {
        type: AttributeType.STRING,
        name: 'pk',
      },
    });
    this.table.addGlobalSecondaryIndex({
      indexName: GSI.Type,
      partitionKey: {
        type: AttributeType.STRING,
        name: 'type',
      },
      sortKey: {
        type: AttributeType.STRING,
        name: 'pk',
      },
    });
  }

  grantRead(entity: IGrantable) {
    this.table.grantReadData(entity);
  }

  grantWrite(entity: IGrantable) {
    this.table.grantWriteData(entity);
  }
}
