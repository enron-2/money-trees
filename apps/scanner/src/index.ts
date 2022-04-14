import { setup } from '../lib/scanner';

exports.handler = async (event : any) => {
    const resp = setup(event);

    return {
        statusCode: 200,
        body: JSON.stringify(resp)
    }
}