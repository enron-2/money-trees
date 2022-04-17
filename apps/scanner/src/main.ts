import { scanner } from './lib/badname';

exports.handler = async (event : any) => {
    const resp = scanner(event);

    return {
        statusCode: 200,
        body: JSON.stringify(resp)
    }
}