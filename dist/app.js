"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const method_override_1 = __importDefault(require("method-override"));
const dotenv_1 = require("dotenv");
const firebase_1 = __importDefault(require("./tool/firebase"));
class App {
    constructor(controllers) {
        console.log('App constructor');
        this.express = express_1.default();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }
    static getInstance(controllers) {
        if (!App.instance) {
            App.instance = new App(controllers);
        }
        return App.instance;
    }
    static init() {
        console.log('App init');
        App.initDotEnv();
        console.log('NODE_ENV=' + process.env.NODE_ENV);
        if (!process.env.PORT) {
            throw new Error('ENV PORT is required');
        }
    }
    static initDotEnv() {
        console.log('DotENV init');
        const result = dotenv_1.config();
        if (result.error) {
            let error = result.error;
            if (error.code && error.code !== 'ENOENT') {
                throw error;
            }
            else {
                console.info('DotENV no .env file');
            }
        }
        if (!process.env.NODE_ENV) {
            throw new Error('ENV NODE_ENV is required');
        }
    }
    initSession() {
        console.log('Session init');
        if (!process.env.SESSION) {
            throw new Error('ENV SESSION is required');
        }
        this.sessionConfig = JSON.parse(process.env.SESSION);
        if (process.env.SESSION_STORE_TYPE === 'firestore-store') {
            this.sessionConfig.store = firebase_1.default.getInstance().getFirestoreStore();
        }
        this.express.set('trust proxy', 1);
        this.express.use(express_session_1.default(this.sessionConfig));
    }
    initializeMiddlewares() {
        console.log('Middlewares init');
        this.express.use(express_1.default.json());
        this.express.use(express_1.default.urlencoded({ extended: true }));
        this.express.use(method_override_1.default((req, res) => {
            if (req.body._method) {
                var method = req.body._method;
                delete req.body._method;
                return method;
            }
            return req.method;
        }));
        this.initSession();
    }
    initializeControllers(controllers) {
        console.log('Controllers init');
        controllers.forEach(controller => {
            this.express.use('/', controller.router);
        });
    }
    run() {
        this.express.listen(process.env.PORT, () => {
            console.log(`Express listening on the port ${process.env.PORT}...`);
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map