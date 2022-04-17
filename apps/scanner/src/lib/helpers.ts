import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"; // AbortMultipartUploadCommand ??
import { IssuesType } from './scanners/scanner';

let s3_client : S3Client;

export const client = (region? : string) =>
    (s3_client === undefined)
    ? new S3Client({
        region: region,
        credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_KEY
        }})
    : s3_client;

interface BucketType {
    Bucket: string,
    Key: string
}

export const fetch_from_s3 = async (bucket : BucketType) => {
	const command = new GetObjectCommand({ Bucket: `e2/${bucket.Bucket}`, Key: bucket.Key })

	try {
		const response = await client().send(command);
		return response.Body.toString();
	} catch (error : any) {
		console.error('fail');
	} finally {
		console.log('hello');
	}
}

export const fetch_repo = async (repoName : string) => {
    // TODO: download the repository to /tmp/repo
}

export const publish = () => {
    // TODO: upload the package to CodeArtifact
}

export const addIssues = (issues : IssuesType[]) => {
    // TODO: push those issues to the database
}