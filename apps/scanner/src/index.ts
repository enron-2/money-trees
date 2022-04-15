import { scanner } from './lib/scanner';

exports.handler = async (event : any) => {
    const resp = scanner(event);

    return {
        statusCode: 200,
        body: JSON.stringify(resp)
    }
}