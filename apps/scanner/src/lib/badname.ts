import { Controller } from './controller';

interface ResultType {
    success: boolean,
    issues: IssuesType[]
}

interface IssuesType {
    pkgName: string,
    pkgVers: string
}

const publish = () => {

}

const addIssues = (issues : IssuesType[]) => {
    
}

export const scanner = async (event : any) => {
    const controller : Controller = await new Controller().build(event);

    const results : ResultType = controller.scan();
    if (results.success) {
        publish(); // publish to CodeArtifact
    } else {
        addIssues(results.issues); // Add the issues to the database
    }

    controller.clean();
}