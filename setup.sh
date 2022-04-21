#!/bin/env bash

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

read -p "Codeartifact domain name: " CA_DOMAIN

read -p "Github Access Token: " GH_TOKEN
read -p "Github Org Name: " GH_ORG

read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "AWS Region: " AWS_REGION

cd ./apps/deployment

export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
export AWS_REGION="$AWS_REGION"

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

echo "Deploying application"
npx cdk deploy --all --parameters CodeArtifactDomainName="$CA_DOMAIN" --parameters GithubOrgName="$GH_ORG"


echo "Linking Webhook to Github Org"
STACK_NAME="StaHooks"
KEY="PIPELINE_LINKER_URL"
PIPELINE_LINKER_URL="$(getCfnOutput "$KEY")"
if [ $PIPELINE_LINKER_URL -z ];
then
    echo "PIPELINE_LINKER_URL CFN_OUTPUT NOT FOUND"
    exit 1
fi
curl -s $PIPELINE_LINKER_URL

echo "Deploying Dashboard"
STACK_NAME="StaHttp"
KEY="APIURL"
# KEY="HTTP_API_URL"
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
npx cdk deploy StaDashboard
