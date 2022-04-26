#!/bin/env bash

npm ci

getCfnOutput() {
  aws cloudformation describe-stacks --stack-name "$STACK_NAME" | jq '.Stacks[0].Outputs[]' -c | while read i; do
      Key=`echo "$i" | jq '.OutputKey' --raw-output`
      Val=`echo "$i" | jq '.OutputValue' --raw-output`
      if [ "$Key" = "$1" ];
      then
        echo -n "$Val"
        break
      fi
  done
}

# TODO: use other than bash script, jq is not a unix tool

echo "SETUP"

read -p "CodeArtifact domain name: " CA_DOMAIN
read -p "CodeArtifact namespace (without '@'): " CA_NAMESPACE

read -p "Github Access Token: " GH_TOKEN
read -p "Github Org Name: " GH_ORG

# TODO: save CA_DOMAIN, and GH_TOKEN into a context file
# if context file exists, don't ask, just use it

read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "AWS Region: " AWS_REGION

if [ ! -z $AWS_ACCESS_KEY_ID ];
then
  export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
fi

if [ ! -z $AWS_SECRET_ACCESS_KEY ];
then
  export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
fi

if [ ! -z $AWS_REGION ];
then
  export AWS_REGION="$AWS_REGION"
fi

echo "Saving Github token into Secrets Manager"
aws secretsmanager create-secret --name GITHUB_TOKEN \
  --secret-string \
  "{ \"GITHUB_TOKEN\": \"$GH_TOKEN\" }" \
  --region $AWS_REGION
# echo "Create secret: \"{ \"GITHUB_TOKEN\": \"$GH_TOKEN\" }\""

echo "Saving AWS Secrets into Secrets Manager"
aws secretsmanager create-secret --name AWS_SECRETS \
  --secret-string \
  "{ \"AWS_ACCESS_KEY_ID\": \"$AWS_ACCESS_KEY_ID\", \"AWS_SECRET_ACCESS_KEY\": \"$AWS_SECRET_ACCESS_KEY\", \"AWS_REGION\": \"$AWS_REGION\" }" \
  --region $AWS_REGION
# echo "Create secret: \
# \"{ \"AWS_ACCESS_KEY_ID\": \"$AWS_ACCESS_KEY_ID\", \"AWS_SECRET_ACCESS_KEY\": \"$AWS_SECRET_ACCESS_KEY\", \"AWS_REGION\": \"$AWS_REGION\" }\""


echo "Building application"
npm run build
npx nx build dashboard

echo "Deploying application"
(cd ./apps/deployment; \
  npx cdk deploy --all \
    --context CodeArtifactDomainName="$CA_DOMAIN" \
    --context GithubOrgName="$GH_ORG" \
    --context CodeArtifactNamespace="$CA_NAMESPACE"
)


echo "Linking Webhook to Github Org"
STACK_NAME="DevHooks"
KEY="DevPipelineLinkerURL"
PIPELINE_LINKER_URL="$(getCfnOutput "$KEY")"
if [ -z $PIPELINE_LINKER_URL ];
then
    echo "PIPELINE_LINKER_URL CFN_OUTPUT NOT FOUND"
    exit 1
fi
curl $PIPELINE_LINKER_URL

echo "Deploying Dashboard"
STACK_NAME="DevHttp"
KEY="DevHttpApiURL"
HTTP_API_URL="$(getCfnOutput "$KEY")"
if [ -z $HTTP_API_URL ];
then
    echo "HTTP_API_URL CFN_OUTPUT NOT FOUND"
    exit 1
fi

tmp_file=`mktemp`

cat ./apps/dashboard/src/environments/environment.prod.ts > $tmp_file

echo "export const environment = {
  production: true,
  apiHost: '$HTTP_API_URL',
};" | tee ./apps/dashboard/src/environments/environment.prod.ts

echo "Building dashboard with production configurations"
npx nx build dashboard

cat $tmp_file > ./apps/dashboard/src/environments/environment.prod.ts

echo "Deploy dashboard"
(cd ./apps/deployment;  npx cdk deploy DevDashboard \
    --context CodeArtifactDomainName="$CA_DOMAIN" \
    --context GithubOrgName="$GH_ORG" \
    --context CodeArtifactNamespace="$CA_NAMESPACE"
)

dash_url="$(getCfnOutput "DevDashboardURL")"
echo "Dashboard URL: $dash_url"
