import { Controller } from './controller';
import { IssuesType } from './lib/scanners/scanner';
import { publish, addIssues } from './lib/helpers';

interface ResultType {
    success: boolean,
    issues: IssuesType[]
}

exports.handler = async (event : any) => {
    const controller : Controller = await new Controller().build(event);

    const results : ResultType = controller.scan();
    if (results.success) {
        publish(); // publish to CodeArtifact
    } else {
        addIssues(results.issues); // Add the issues to the database
    }

    controller.clean();

    return {
        statusCode: 200,
        body: JSON.stringify(resp)
    }
}