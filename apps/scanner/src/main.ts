import { Controller } from './lib/controller';
import { IssuesType } from './lib/scanners/scanner';
import { addIssues } from './lib/helpers';

interface ResultType {
  success: boolean;
  issues?: IssuesType[];
}

exports.handler = async (event: any) => {
  const controller: Controller = await new Controller().build();

  const results: ResultType = controller.scan();
  if (!results.success) {
    addIssues(results.issues);
  }

  controller.clean();

  return {
    statusCode: 200,
  };
};
