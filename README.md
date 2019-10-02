# Natural Cycles

Backend Challenge (Node.JS, Express, prettier & typescript)

## Table of Contents

1. [Prerequisites](#Prerequisites)
   1. [Production & Staging prerequisites](#Production%20%26%20Staging%20prerequisites)
      1. [Firebase Realtime Database ](#Firebase%20Realtime%20Database)
         1. [Service account creation for Admin SDK](#Service%20account%20creation%20for%20Admin%20SDK)
         2. [Create an email index and define read/write rules](#Create%20an%20email%20index%20and%20define%20read%2Fwrite%20rules)
      1. [Session & Cookie config](#Session%20config)
         1. [WARNING for `session.cookie.secure = true`](#WARNING%20for%20%60session.cookie.secure%20%3D%20true%60)
         2. [Info](#Info)
      1. [Blake2b config](#Blake2b%20config)
      1. [App config](#App%20config)
   2. [Development prerequisites](#Development%20prerequisites)
2. [Quickstar](#Quickstart)
   1. [Production & Staging quickstar](#Production%20%26%20Staging%20quickstar)
   2. [Development quickstar](#Development%20quickstar)
3. [Quickstart with now.sh (zeit.co) deployment tool](#Quickstart%20with%20now.sh%20%28zeit.co%29%20deployment%20tool)
   1. [Install Now CLI](#Install%20Now%20CLI)
   2. [Prod & Staging quickstart with now.sh](#Prod%20%26%20Staging%20quickstart%20with%20now.sh)
      1. [Set ENV variables with now secrets](#Set%20ENV%20variables%20with%20now%20secrets)
      2. [Deployment](#Deployment)
         1. [Automatic](#Automatic)
         2. [Manual](#Manual)
   3. [Development quickstart with now.sh](#Development%20quickstart%20with%20now.sh)
4. [Before to use in production](#Before%20to%20use%20in%20production)
5. [TODO (OR NOT)](#TODO%20%28OR%20NOT%29)
6. [Links](#Links)

## Prerequisites

### Production & Staging prerequisites

#### Firebase Realtime Database

##### Service account creation for Admin SDK

Create a service account

Save the content of the `serviceAccountKey.json` in the SERVICE_ACCOUNT environment variable

Documentation: https://firebase.google.com/support/guides/service-accounts

##### Create an email index and define read/write rules

In the Firebase Console > Project > Database > Rules, replace and save the following configuration:

```
{
  "rules": {
    ".read": "auth.uid != null",
    ".write": false,
    "development": {
      "user": {
      	".indexOn": ["email"]
      }
    },
    "production": {
      "user": {
      	".indexOn": ["email"]
      }
    }
  }
}
```

Documentation: https://firebase.google.com/docs/database/security

#### Session config

Create the SESSION environment variable from the `.env.example` file (production example) & define name, secret & domain

Documentation: https://www.npmjs.com/package/express-session

##### WARNING for `session.cookie.secure = true`

The connexion should be https and https only, otherwise the cookie won't be set.

If NGINX proxy is used, NGINX conf should contain:

```
map $http_x_forwarded_proto $proxy_x_forwarded_proto {
  default $http_x_forwarded_proto;
  ''      $scheme;
}
proxy_set_header X-Forwarded-Proto $proxy_x_forwarded_proto;
```

##### Info

`session.cookie.domain = "domain.com"`

main domain (and subdomains for news browsers)

`session.cookie.maxAge = 3153600000000`

1000 ms x 60 s x 60 m x 24 h x 365 j = 100 ans

#### Blake2b config

Create the BLAKE2B environment variable from the `.env.example` file & define key & salt

#### App config

Create the PORT environment variable from the `.env.example` file & define the backend application port

Create the NODE_ENV environment variable from the `.env.example` file & define the environment (`development`, `production`, ...)

### Development prerequisites

Copy `.env.example` to `.env`

Follow the two Firebase steps (see "[Production & Staging prerequisites](#Production%20%26%20Staging%20prerequisites)") and set the ENV variables (of all the "[Production & Staging prerequisites](#Production%20%26%20Staging%20prerequisites)" steps) in this `.env` file

For the SESSION environment variable, use the development example

Then you are ready to go (Development quickstart or Development quickstart with https://now.sh)

## Quickstart

### Production & Staging quickstar

```

$ npm install --only=production
$ npm run start

```

### Development quickstar

```

$ npm install
$ npm run dev

```

Open http://localhost:8080

## Quickstart with [now.sh](https://now.sh) ([zeit.co](https://zeit.co)) deployment tool

### Install Now CLI

```
$ npm i -g now
$ now login
```

### Prod & Staging quickstart with now.sh

#### Set ENV variables with now secrets

```
$ now secrets add node_env production

$ now secrets add port 80

$ now secrets add blake2b '{"key": "key - up to 64 bytes for blake2b, 32 for blake2s blake2s blake2s", "salt": "<n47ur4l cycl35>"}'

$ now secrets add service_account '{"type": "service_account","project_id": "natural-cycles-[id]","private_key_id": "[40 hexa characters]","private_key": "-----BEGIN PRIVATE KEY-----\n[very long key]\n-----END PRIVATE KEY-----\n","client_email": "firebase-adminsdk-[id]@natural-cycles-[id].iam.gserviceaccount.com","client_id": "[21 numbers]","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-[id]c%40natural-cycles-[id].iam.gserviceaccount.com"}'

# WARN cookies doesn't work well with the production settings yet (debug in progress) use the development settings for now (see env.example)
$ now secrets add session '{"name": "[cookie-name]","secret": "[string or array. more informations here https://www.npmjs.com/package/express-session]","cookie": {  "secure": true,  "httpOnly": true,  "sameSite": "lax",  "domain": "now.sh",  "maxAge": 3153600000000},"resave": false,"saveUninitialized": false}'
```

#### Deployment

##### Automatic

Deploy are automatically done when pushing on github when you create a new "Project from github" on [now.sh](https://now.sh)

##### Manual

```
$ cd natural-cycles # move to the project directory
$ now # deploy to staging
```

Actual staging is here https://natural-cycles-staging.now.sh

### Development quickstart with now.sh

$ cd natural-cycles
$ now dev

## Before to use in production

- Use a session store in order to keep the client session through all instances and to be server crash resilient (such as connect-redis)
- If there is a huge amount of accounts and/or few memory on the server, remove UserController.users (UserCollection) and query directly the database
- If the app is used behind a proxy: https://expressjs.com/en/guide/behind-proxies.html
- Emails should be encrypted in the database (if someone access to the data, he should not be able to get the emails)
- Use Helmet & follow "Production Best Practices: Security" https://expressjs.com/en/advanced/best-practice-security.html
- Use the cors in order to reduce unexpected traffic https://www.npmjs.com/package/cors
- Use of Node.js clusters on servers with multicores processor in order to improve the performances

## TODO (OR NOT)

- use git-secrets for saving keys (firebase, cookie, blake2b...)
- Backend authentification
- Unit testing
- Add code documentation https://typedoc.org/guides/doccomments/
- Implement an iterator on UserCollection
- HTTPS SSL certificate
- Use namespaces? https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html
- Static route table for each controller
- Use templating system with views http://expressjs.com/en/guide/using-template-engines.html
- Use bootstrap

## Links

- https://docs.npmjs.com/files/package.json
- https://docs.npmjs.com/misc/scripts
- https://prettier.io/docs/en/options.html
- https://nodejs.org/dist/latest-v12.x/docs/api/
- https://www.typescriptlang.org/docs/handbook/compiler-options.html
- https://node.green/#ES2016 # all good since node 7.5.0 (for ES2016 only)
- http://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html
- https://github.com/DefinitelyTyped/DefinitelyTyped
- https://www.typescriptlang.org/docs/handbook/basic-types.html
- https://firebase.google.com/docs/database/admin/start
- https://nodejs.org/api/cluster.html
- https://cloud.google.com/blog/products/gcp/help-keep-your-google-cloud-service-account-keys-safe
