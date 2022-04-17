import { scanner } from './lib/runner';

exports.handler = async (event : any) => {
    const resp = scanner(event);

    return {
        statusCode: 200,
        body: JSON.stringify(resp)
    }
}