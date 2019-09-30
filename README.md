# Natural Cycles

Backend Challenge (Node.JS, Express, prettier & typescript)

## Development Quickstart

```
$ npm install
$ npm run start
```

## Production Quickstart

```
$ npm install --only=production
$ npm run prod-start
```

## Firebase Realtime Database

# Define rules and email table index

In the "Rules" tabulation in the firebase console, replace and save the following configuration:

```
{
  /* Visit https://firebase.google.com/docs/database/security to learn more about security rules. */
  "rules": {
    ".read": "auth.uid != null",
    ".write": false,
    "development": {
      "user": {
      	".indexOn": ["email"]
      }
    }
  }
}
```

## TODO

- ~~define generateIdFromEmail in user controller~~
- use email hash + salt in generateIdFromEmail
- implement email & ID unicity
- "Should have “Create” button where you specify ID and email and can Insert a record in the DB. ID should be autogenerated and unique, email should be valid and also unique." you specify ID but autogenerated?
- add config howto in README
- create config files (session, firebase, blake2b & app) for example
- make config files required on startup (for controllers and tool classes)
- add code documentation https://medium.com/4thought-studios/documenting-javascript-projects-f72429da2eea
- unit testing
- ~~App & FirebaseDB singleton~~
- implement an iterator on UserCollection
- use ~~hashids, crypto or bcrypt or~~ blake2b for ID hash? https://www.npmjs.com/package/hashids
- generate hash from email + salt as id?
- use of escape-html for display
- HTTPS ssl certificate
- use namespaces? https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html
- encrypt email
- use Helmet & check "Production Best Practices: Security" https://expressjs.com/en/advanced/best-practice-security.html
- use of cors https://www.npmjs.com/package/cors
- secure form post values before saving in session / db
- create a User model and use it in the session
- SessionInterface set userId and userEmail as optionnal (userId?: string) and as an user object User{id: string; email: string}?
- ~~.env file (dev/prod) with dotenv~~
- static route table for each controller
- use templating system with views http://expressjs.com/en/guide/using-template-engines.html
- add bootstrap?
- exclude the dist folder for development branch and the src directory for the production branch
- use of Node.js clusters

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
