import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"; // AbortMultipartUploadCommand ??
import config from '../tmp/config.json';

export const setup = async () => {
    const client = new S3Client({
        region: config.region,
        credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID?,
            secretAccessKey: process.env.SECRET_ACCESS_KEY?
        }
    });

    config.scanners.forEach(async (scanner : string) => {
        const command = new GetObjectCommand({ Bucket: 'scanners', Key: `${scanner}.zip` });

        try {
            const response = await client.send(command);
        } catch (error : any) {
            return Promise.reject(error)
        } finally {
            
        }
    });
}
