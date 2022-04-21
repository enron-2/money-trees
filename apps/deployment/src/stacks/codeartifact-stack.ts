import { Stack, StackProps, Construct } from '@aws-cdk/core';
import * as codeArtifact from '@aws-cdk/aws-codeartifact';

export interface CodeArtifactStackProps extends StackProps {
  stageName: string;
}

export class CodeArtifactStack extends Stack {
  constructor(scope: Construct, id: string, props: CodeArtifactStackProps) {
    super(scope, id, props);

    /* this is bucketname for directory */
    const orgName = this.node.tryGetContext('CodeArtifactDomainName');
    if (!orgName) throw new Error('CodeArtifactDomainName context undefined');
    const caDomain = new codeArtifact.CfnDomain(
      this,
      `${props.stageName} CA Domain`,
      {
        domainName: orgName,
      }
    );

    const publicRepo = new codeArtifact.CfnRepository(
      this,
      `${props.stageName} Public Repo`,
      {
        domainName: caDomain.domainName,
        repositoryName: 'public-' + orgName,
        externalConnections: ['public:npmjs'],
      }
    );
    publicRepo.addDependsOn(caDomain);

    const privateRepo = new codeArtifact.CfnRepository(
      this,
      `${props.stageName} Private Repo`,
      {
        domainName: caDomain.domainName,
        repositoryName: 'private-' + orgName,
        upstreams: [publicRepo.repositoryName],
      }
    );
    privateRepo.addDependsOn(publicRepo);
  }
}
