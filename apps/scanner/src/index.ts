import { setup } from '../lib/scanner';

exports.handler = async (event : any) => {
    const resp = setup(event.Records[0].s3.bucket.name);

    return {
        statusCode: 200,
        body: JSON.stringify(resp)
    }
}