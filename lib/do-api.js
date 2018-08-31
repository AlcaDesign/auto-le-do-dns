const rp = require('request-promise-native');
const ocean = rp.defaults({
		baseUrl: 'https://api.digitalocean.com/v2/',
		headers: {
			Authorization: 'Bearer ' + process.env.DO_PAT
		},
		json: true,
		simple: false,
		resolveWithFullResponse: true
	});

async function listDomainRecords(domainName) {
	let { statusCode, body } = await ocean({
		url: `domains/${domainName}/records`
	});
	return body;
}

async function createDomainRecord(domainName, newRecord) {
	let { statusCode, body } = await ocean({
		url: `domains/${domainName}/records/`,
		method: 'POST',
		body: Object.assign({
			type: '',
			name: '',
			data: '',
			priority: null,
			port: null,
			ttl: 3600,
			weight: null,
			flags: null,
			tag: null
		}, newRecord)
	});
	// statusCode === 201
	return body;
}

function createTXTDomainRecord(domainName, newRecord) {
	return createDomainRecord(domainName, Object.assign({
		type: 'TXT',
	}, newRecord));
}

function createACMEChallengeDomainRecord(domainName, data = '') {
	return createTXTDomainRecord(domainName, {
		name: '_acme-challenge',
		data
	});
}

async function updateDomainRecord(domainName, recordID, changes) {
	let { statusCode, body } = await ocean({
		url: `domains/${domainName}/records/${recordID}`,
		method: 'PUT',
		body: changes
	});
	return body;
}

async function deleteDomainRecord(domainName, recordID) {
	let { statusCode, body } = await ocean({
		url: `domains/${domainName}/records/${recordID}`,
		method: 'DELETE'
	});
	// statusCode === 204
	return body;
}

module.exports = {
	listDomainRecords,
	createDomainRecord,
	updateDomainRecord,
	deleteDomainRecord,
	
	createTXTDomainRecord,
	createACMEChallengeDomainRecord
};
