import { fetch_from_s3, client } from './helpers';
import { execSync } from 'child_process';
import { Scanner } from './scanners/scanner';

interface IssuesType {
	pkgName: string,
	pkgVers: string
}

export class Controller {
	scanners : Array<Scanner>;

	constructor() {}

	// not part of the constructor as it needs to be async
	build = async (event : any) => {
		client(event.Records[0].s3.bucket.region)
		const config = JSON.parse(
			await fetch_from_s3({ Bucket: 'e2', Key: 'config' })
		);

		this.scanners = config.scanners.map(
			(scanner : string) => this.setup(scanner)
		);

		return this;
	}

	setup = (scanner : string) => {
		const scanner : Scanner = 

		this.scanners.forEach(
			(scanner : Scanner) => scanner.setup()
		);
	}

	scan = () => {
		const issues : IssuesType[] = this.scanners.map(
			(scanner : Scanner) => scanner.run()
		);

		return {
			success: (issues === []),
			issues: issues
		}
	}

	// can this be a destructor? Do they exist in JS?
	clean = () => {
		this.scanners.forEach(
			(scanner : Scanner) => scanner.cleanup()
		);
		execSync(`rm -rf ./tmp/repo/* ./tmp/scanners/*`)
	}
}