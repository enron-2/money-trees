import { Scanner } from './scanner';

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

const addIssues = () => {
    
}

export const scanner = async (event : any) => {
    const scanner : Scanner = new Scanner();
    await scanner.build(event);

    const results : ResultType = scanner.run();

    if (results.success) {
        publish(); // publish to CodeArtifact
    } else {
        addIssues(results.issues); // Add the issues to the database
    }

    scanner.cleanup();
}