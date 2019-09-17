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

## TODO

- unit testing
- use hashids for ID, crypto or bcrypt? https://www.npmjs.com/package/hashids
- Generate hash from email + salt as id?
- HTTPS ssl certificate
- use namespaces? https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html
- encrypt email
- Use Helmet & check "Production Best Practices: Security" https://expressjs.com/en/advanced/best-practice-security.html
- Secure form post values before saving in session / db
- Create a User model and use it in the session
- SessionInterface set userId and userEmail as optionnal (userId?: string) and as an user object User{id: string; email: string}?
- .env file (dev/prod) with dotenv and fix session config for prod
- static route table for each controller
- use templating system with views
- add bootstrap?
- exclude the dist folder for development branch and the src directory for the production branch

## Links

- https://docs.npmjs.com/files/package.json
- https://docs.npmjs.com/misc/scripts
- https://prettier.io/docs/en/options.html
- https://nodejs.org/dist/latest-v12.x/docs/api/
- https://www.typescriptlang.org/docs/handbook/compiler-options.html
- http://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html
- https://github.com/DefinitelyTyped/DefinitelyTyped
- https://www.typescriptlang.org/docs/handbook/basic-types.html
- https://en.wikipedia.org/wiki/Comparison_of_cryptographic_hash_functions
