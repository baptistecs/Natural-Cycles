# Natural Cycles

Backend Challenge (Node.JS, Express, prettier & typescript)

## Development prerequisites

Copy `.env.example` to `.env`

Follow the two Firebase steps (see "Production prerequisites") and set the ENV variables (for all the "Production prerequisites" steps) in this `.env` file

For the SESSION environment variable, use the development example

Then you are ready to go (Development quickstart)

## Production prerequisites

### Firebase Realtime Database - Service account creation for Admin SDK

Create a service account

Save the content of the `serviceAccountKey.json` in the SERVICE_ACCOUNT environment variable

Documentation: https://firebase.google.com/support/guides/service-accounts

### Firebase Realtime Database - Create an email index and define read/write rules

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

### Session config

Create the SESSION environment variable from the `.env.example` file (production example) & define name, secret & domain

Documentation: https://www.npmjs.com/package/express-session

#### WARNING if `session.cookie.secure = true`

The connexion should be https and https only

If NGINX proxy is used, NGINX conf should contain:

```
map $http_x_forwarded_proto $proxy_x_forwarded_proto {
  default $http_x_forwarded_proto;
  ''      $scheme;
}
proxy_set_header X-Forwarded-Proto $proxy_x_forwarded_proto;
```

#### Info

`session.cookie.domain = "domain.com"`

main domain (and subdomains for news browsers)

`session.cookie.maxAge = 3153600000000`

1000 ms x 60 s x 60 m x 24 h x 365 j = 100 ans

### Blake2b config

Create the BLAKE2B environment variable from the `.env.example` file & define key & salt

### App config

Create the PORT environment variable from the `.env.example` file & define the backend application port

Create the NODE_ENV environment variable from the `.env.example` file & define the environment (`development`, `production`, ...)

## Development quickstart

```

$ npm install
$ npm run start

```

Open http://localhost:8080

## Production quickstart

```

$ npm install --only=production
$ npm run prod-start

```

## Staging quickstart

Example with now.sh (zeit.co)

```
$ npm i -g now # install now client globally
$ now login # login with your email

# NOW.SH secrets setting example
$ now secrets add node_env production
$ now secrets add port 80
$ now secrets add blake2b '{"key": "key - up to 64 bytes for blake2b, 32 for blake2s blake2s blake2s", "salt": "<n47ur4l cycl35>"}'
$ now secrets add service_account '{"type": "service_account","project_id": "natural-cycles-[id]","private_key_id": "[40 hexa characters]","private_key": "-----BEGIN PRIVATE KEY-----\n[very long key]\n-----END PRIVATE KEY-----\n","client_email": "firebase-adminsdk-[id]@natural-cycles-[id].iam.gserviceaccount.com","client_id": "[21 numbers]","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-[id]c%40natural-cycles-[id].iam.gserviceaccount.com"}'
$ now secrets add session '{"name": "[cookie-name]","secret": "[string or array. more informations here https://www.npmjs.com/package/express-session]","cookie": {  "secure": true,  "httpOnly": true,  "sameSite": "lax",  "domain": "now.sh",  "maxAge": 3153600000000},"resave": false,"saveUninitialized": false}'

$ cd natural-cycles # move to the project directory
$ now # deploy to staging
```

Actual staging is here https://natural-cycles-staging.now.sh

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
- https://en.wikipedia.org/wiki/Comparison_of_cryptographic_hash_functions
- https://firebase.google.com/docs/database/admin/start
- https://nodejs.org/api/cluster.html
- https://cloud.google.com/blog/products/gcp/help-keep-your-google-cloud-service-account-keys-safe

```

```
