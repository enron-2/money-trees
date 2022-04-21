import { SecretsManager } from 'aws-sdk';

interface SecretsType {
  access_key: string;
  secret_key: string;
}

export const secrets: SecretsType = {
  access_key: '',
  secret_key: '',
};

const secretsManager: SecretsManager = new SecretsManager();

export const init_secrets = async () => {
  const { SecretString } = await secretsManager
    .getSecretValue({ SecretId: 'AWS_SECRETS' })
    .promise();
  secrets.access_key = JSON.parse(SecretString).AWS_ACCESS_KEY_ID;
  secrets.secret_key = JSON.parse(SecretString).AWS_SECRET_ACCESS_KEY;
};
