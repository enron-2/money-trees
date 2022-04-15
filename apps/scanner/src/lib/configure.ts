import { fetch_from_s3, client } from './helpers';

export const configure = async (event : any) => {
	client(event.Records[0].s3.bucket.region)

	const config = JSON.parse(
		await fetch_from_s3({ Bucket: 'e2', Key: 'config' })
	);

	await config.scanners.forEach(
		async (scanner : any) => fetch_from_s3(scanner)
	);

	setup(config.scanners);
}

const setup = async (scanners : Array<String>) => {
	// for scanner in ./tmp/scanners/*; do ./tmp/scanners/$scanner/run.sh setup; done
}

const cleanup = async (scanners : Array<String>) => {
	// rm -rf ./tmp/repo/* ./tmp/config
    // for scanner in ./tmp/scanners/*; do ./tmp/scanners/$scanner/run.sh cleanup; done
}