require('dotenv').config();
const doAPI = require('./lib/do-api');
const exit = (...args) => console.log('[Exiting]', ...args);

if(!process.env.DO_PAT) {
	return exit('No personal access token in the environment at "DO_PAT"');
}

let pArgs = process.argv.slice(2);
let [ domainName, record1, record2 ] = pArgs;
let exitDN = `(${domainName})`;
let cliFormat = 'Format: node cli.js <domain> <txt-record-1> <txt-record-2>';

if(pArgs.some(n => [ '--help', '-h', '/?' ].includes(n))) {
	return exit(cliFormat);
}
else if(pArgs.length !== 3) {
	if(pArgs.length < 3) {
		console.log('Need', 3 - pArgs.length, 'more arguments');
	}
	else {
		console.log(pArgs.length - 3 + ' too many arguments');
	}
	return exit(cliFormat);
}

if(!/[\-\w]+\.\w+/.test(domainName)) {
	return exit('Are you sure arg 1 is a domain name?', exitDN);
}

(async () => {
	let { domain_records } = await doAPI.listDomainRecords(domainName);
	if(!domain_records) {
		return exit('Could not retrieve domain records', exitDN);
	}
	else if(!domain_records.length) {
		return exit('No domain records found at all', exitDN);
	}
	let serverIPs = domain_records.filter(n =>
			n.name === '@' && (n.type === 'A' || n.type === 'AAAA')
		)
		.map(n => n.type === 'AAAA' ? `[${n.data}]` : n.data);
	console.log('Editing domain records for:', serverIPs.join(', '));
	let existingChallengeRecords = domain_records.filter(n =>
			n.type === 'TXT' && n.name === '_acme-challenge'
		);
	let createRecords = [];
	let updateRecords = [];
	let deleteRecords = [];
	if(existingChallengeRecords.length === 0) {
		console.log('Creating "_acme-challenge" TXT records');
		createRecords = pArgs.slice(1).map(data => ({ data }));
	}
	else if(existingChallengeRecords.length >= 2) {
		updateRecords = pArgs.slice(1).map((data, i) => (
				{
					data,
					id: existingChallengeRecords[i].id
				}
			));
		if(existingChallengeRecords.length === 2) {
			console.log('Replacing existing "_acme-challenge" TXT records');
		}
		else {
			console.log('Replacing existing "_acme-challenge" TXT records and',
				'removing extra existing "_acme-challenge" TXT records');
			deleteRecords = existingChallengeRecords.slice(2);
		}
	}
	else if(existingChallengeRecords.length === 1) {
		console.log('Replacing an existing "_acme-challenge" TXT record and',
			'creating 1 additional "_acme-challenge" TXT record');
		updateRecords.push({
				data: record1,
				id: existingChallengeRecords[0].id
			});
		createRecords.push({ data: record2 });
	}
	
	try {
		await Promise.all([
			Promise.all(
				createRecords.map(n =>
					doAPI.createACMEChallengeDomainRecord(domainName, n.data)
				)
			).then(a => console.log('Created', a.length, 'records')),
			Promise.all(
				updateRecords.map(n =>
					doAPI.updateDomainRecord(domainName, n.id, { data: n.data })
				)
			).then(a => console.log('Updated', a.length, 'records')),
			Promise.all(
				deleteRecords.map(n =>
					doAPI.deleteDomainRecord(domainName, n.id)
				)
			).then(a => console.log('Deleted', a.length, 'records'))
		]);
	} catch(err) {
		console.error(err);
	}
})();
