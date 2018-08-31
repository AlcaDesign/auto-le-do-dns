# auto-le-do-dns

Node.js tool to add/update/delete DNS records on DigitalOcean for use with Let's
Encrypt.

It will look for pre-existing "\_acme-challenge" records in the DNS for the
specified domain name. Any existing records will be reused and others will be
deleted. New records will be created as needed.

This tool currently assumes that certbot is requesting exactly 2 TXT records be
created for the challenge.

## Usage

Currently, auto-le-do-dns is just set up as a cli-facing Node.js script to be run
from the auto-le-do-dns directly. It uses the "DO_PAT" environment

```
node cli.js <domain.name> <record 1> <record 2>
```

## Setup

Clone and install with NPM:

```bash
git clone https://github.com/AlcaDesign/auto-le-do-dns.git
npm install
```

Add "DO_PAT" to your environment or create a `.env` file in the root directory.
The value should be an access token, or a personal access token, for the
matching DigitalOcean account with the domains. This may be added as a cli
option in future version.

Using a .env file:

```bash
echo "DO_PAT=8bf80827aa55625510884566b239cde1a6648b4a35751766bfced5bfee042915" > .env
node cli.js domain.name record1 record2
```

Inline with the command:

```bash
DO_PAT=8bf80827aa55625510884566b239cde1a6648b4a35751766bfced5bfee042915 node cli.js domain.name record1 record2
```

You may need to prepend `env` in some instances:

```bash
env DO_PAT=8bf80827aa55625510884566b239cde1a6648b4a35751766bfced5bfee042915 node cli.js domain.name record1 record2
```

# Why?

I created this script so that I could more easily handle Let's Encrypt wildcard
challenges for several DO accounts. Having to request 2fa codes from other
people is not as convenient as it could be. Now the process is the initial setup
for the DNS on DigitalOcean, grab an access token for that account and set up
this script. Once that's done and for future renews, start up the Let's Encrypt
flow in one terminal, this script at the ready in another terminal, copy and
paste the challenge tokens between the terminals and finish the LE flow.
