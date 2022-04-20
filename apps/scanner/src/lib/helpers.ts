import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'; // AbortMultipartUploadCommand ??
import { IssuesType } from './scanners/scanner';
import { secrets } from './secrets';
import config from '../assets/config.json';

let s3_client: S3Client;

export const client = (region?: string) =>
  s3_client === undefined
    ? new S3Client({
        region: region,
        credentials: {
          accessKeyId: secrets.access_key,
          secretAccessKey: secrets.secret_key,
        },
      })
    : s3_client;

interface BucketType {
  Bucket: string;
  Key: string;
}

export const fetch_local = () => config;

export const fetch_s3 = async (bucket: BucketType) => {
  client();

  const command = new GetObjectCommand(bucket);

  try {
    const response = await client().send(command);
    return response.Body.toString();
  } catch (error: any) {
    console.error('fail'); // TODO: fix this
  }
};

const severity = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

export const addIssues = async (issues: IssuesType[]) => {
  issues.forEach(async (issue: IssuesType) => {
    await fetch(`${process.env.BACKEND_URL}/vulns`, {
      method: 'POST',
      body: JSON.stringify({
        name: `CVE-${123}`,
        description: `${issue.location}: ${issue.description}`,
        severity: severity[issue.severity],
        packageIds: 1,
      }),
    });
  });
};
