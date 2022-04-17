import { execSync, spawn } from 'child_process';
import { fetch_from_s3, client } from './helpers';

interface IssuesType {
	pkgName: string,
	pkgVers: string
}

export class Scanner {
	scanners : Array<String>;

	constructor() {}

	// not part of the constructor as it needs to be async
	build = async (event : any) => {
		client(event.Records[0].s3.bucket.region)

		const config = JSON.parse(
			await fetch_from_s3({ Bucket: 'e2', Key: 'config' })
		);
		this.scanners = config.scanners;

		this.scanners.forEach(
			async (scanner : any) => fetch_from_s3(scanner)
		);

		this.setup();
	}

	setup = () => {
		this.scanners.forEach(
			(scanner : string) => execSync(`./tmp/scanners/${scanner}/setup setup`)
		);
	}

	run = () => {
		const issues : IssuesType[] = [];

		this.scanners.forEach((scanner : string) => {
				spawn(`./tmp/scanners/${scanner}/setup run`)
			}
		);

		return {
			success: (issues === []),
			issues: issues
		}
	}

	// can this be a destructor? Do they exist in JS?
	cleanup = () => {
		this.scanners.forEach(
			(scanner : string) => execSync(`./tmp/scanners/${scanner}/setup cleanup`)
		);
		execSync(`rm -rf ./tmp/repo/* ./tmp/scanners/*`)
	}
}