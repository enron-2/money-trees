import { Stack, StackProps, Construct } from '@aws-cdk/core';
import * as codeArtifact from '@aws-cdk/aws-codeartifact';

export interface CodeArtifactStackProps extends StackProps {
  stageName: string;
}

export class CodeArtifactStack extends Stack {
  constructor(scope: Construct, id: string, props: CodeArtifactStackProps) {
    super(scope, id, props);

    const orgName = this.node.tryGetContext('CodeArtifactDomainName');
    if (!orgName) throw new Error('CodeArtifactDomainName context undefined');
    const caDomain = new codeArtifact.CfnDomain(
      this,
      `${props.stageName} CA Domain`,
      {
        domainName: orgName,
      }
    );

    const privateRepo = new codeArtifact.CfnRepository(
      this,
      `${props.stageName} Private Repo`,
      {
        domainName: caDomain.domainName,
        repositoryName: 'private-' + orgName,
      }
    );
    privateRepo.addDependsOn(caDomain);

    const publicRepo = new codeArtifact.CfnRepository(
      this,
      `${props.stageName} Public Repo`,
      {
        domainName: caDomain.domainName,
        repositoryName: 'public-' + orgName,
        externalConnections: ['public:npmjs'],
      }
    );
    publicRepo.addDependsOn(privateRepo);

    const base = new codeArtifact.CfnRepository(
      this,
      `${props.stageName} Base Repo`,
      {
        domainName: caDomain.domainName,
        repositoryName: 'base-' + orgName,
        upstreams: [privateRepo.repositoryName, publicRepo.repositoryName],
      }
    );
    base.addDependsOn(publicRepo);
  }
}
