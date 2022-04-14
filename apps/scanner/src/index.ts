import { configure } from './lib/scanner';

exports.handler = async (event : any) => {
    const resp = configure(event);

    return {
        statusCode: 200,
        body: JSON.stringify(resp)
    }
}