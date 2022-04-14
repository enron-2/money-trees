import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"; // AbortMultipartUploadCommand ??

interface BucketType {
	Bucket: string,
	Key: string
}

const fetch_from_s3 = async (client : S3Client, scanner : BucketType) => {
	const command = new GetObjectCommand({ Bucket: `e2/${scanner.Bucket}`, Key: `${scanner.Key}.zip` })

	try {
		const response = await client.send(command);
		return response.Body.toString();
	} catch (error : any) {
		console.error('fail');
	} finally {
		console.log('hello');
	}
}

export const setup = async (event : any) => {
	const abc = event.Records[0].s3.bucket.name

	const client = new S3Client({
		region: config.region,
		credentials: {
			accessKeyId: process.env.ACCESS_KEY_ID,
			secretAccessKey: process.env.SECRET_ACCESS_KEY
		}
	});

	const config = JSON.parse(await fetch_from_s3(client, { Bucket: 'e2', Key: 'config' }));

	config.scanners.forEach(async (scanner : any) => fetch_from_s3(client, scanner));
}
