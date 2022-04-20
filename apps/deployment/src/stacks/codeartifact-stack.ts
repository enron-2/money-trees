import { Stack, StackProps, Construct } from '@aws-cdk/core';
import * as codeArtifact from '@aws-cdk/aws-codeartifact';

export class CreateCodeArtifactStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /* this is bucketname for directory */
    const caDomain = new codeArtifact.CfnDomain(this, 'CA Domain', {
      domainName: 'Enron-2',
    });

    const publicRepo = new codeArtifact.CfnRepository(this, 'Public Repo', {
      domainName: caDomain.domainName,
      repositoryName: 'public-Enron-2',
      externalConnections: ['public:npmjs'],
    });
    publicRepo.addDependsOn(caDomain);

    const privateRepo = new codeArtifact.CfnRepository(this, 'Private Repo', {
      domainName: caDomain.domainName,
      repositoryName: 'private-Enron-2',
      upstreams: [publicRepo.repositoryName],
    });
    privateRepo.addDependsOn(publicRepo);
  }
}
