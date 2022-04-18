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
  const { SecretString: access_key } = await secretsManager
    .getSecretValue({ SecretId: 'ACCESS_KEY_ID' })
    .promise();
  secrets.access_key = access_key;

  const { SecretString: secret_key } = await secretsManager
    .getSecretValue({ SecretId: 'SECRET_KEY' })
    .promise();
  secrets.secret_key = secret_key;
};
