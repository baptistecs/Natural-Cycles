# Natural Cycles

Backend Challenge (Node.JS, Express, prettier & typescript)

## Development Prerequisites

Just follow the two following Firebase steps (Production Prerequisites) and you are ready to go (Development Quickstart)

## Production Prerequisites

### Firebase Realtime Database - Service account creation for Admin SDK

Create a service account & save the content of the serviceAccountKey.json in `config/production/firebase.json`

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

### Session Config

Copy file from `config/example/session.json` to `config/production/session.json`

Define name, secret & domain and remove comments (as JSON format do not allow comments)

Documentation: https://www.npmjs.com/package/express-session

### App config

Define backend port in `config/production/app.json`

## Development Quickstart

```
$ npm install
$ npm run start
```

Open http://localhost:8080

## Production Quickstart

```
$ npm install --only=production
$ npm run prod-start
```

## Before to use in production

- Use a session store in order to keep the client session through all instances and to be server crash resilient (such as connect-redis)
- If there is a huge amount of accounts and/or few memory on the server, remove UserController.users (UserCollection) and query directly the database
- If the app is used behind a proxy: https://expressjs.com/en/guide/behind-proxies.html
- Emails should be encrypted in the database (if someone access to the data, he should not be able to get the emails)
- Use Helmet & follow "Production Best Practices: Security" https://expressjs.com/en/advanced/best-practice-security.html
- Use the cors in order to reduce unexpected traffic https://www.npmjs.com/package/cors
- Use of Node.js clusters on servers with multicores processor in order to improve the performances

## TODO (OR NOT)

- Backend authentification
- Unit testing
- Make config files required on startup (for controllers and tool classes)
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
