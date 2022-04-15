import { Construct, Duration } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export interface NodeLambdaFuncProps
  extends Omit<lambda.FunctionProps, 'runtime' | 'handler'> {
  code: lambda.Code;
  environment: {
    TABLE_NAME: string;
    [key: string]: string;
  };
}

const generateEnvs = (env?: Record<string, string>) => ({
  NODE_ENV: 'production',
  NO_COLOR: 'true',
  ...env,
});

/**
 * Create `NODEJS_14_X` lambda function with defaults
 *
 * runtime: `NODEJS_14_X`
 * handler: 'main.handler'
 * memorySize: 256MB
 * timeout: 5 seconds
 * environment: `{ NODE_ENV: 'production', NO_COLOR: 'true' }`
 *
 */
export class NodeLambdaFunc extends Construct {
  LambdaFunction: lambda.Function;
  constructor(
    scope: Construct,
    id: string,
    { environment, ...props }: NodeLambdaFuncProps
  ) {
    super(scope, id);
    this.LambdaFunction = new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main.handler',
      memorySize: 256,
      timeout: Duration.seconds(5),
      environment: generateEnvs(environment),
      ...props,
    });
  }
}
