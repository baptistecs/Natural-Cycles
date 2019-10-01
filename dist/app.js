"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const method_override_1 = __importDefault(require("method-override"));
const dotenv_1 = require("dotenv");
class App {
    constructor(controllers) {
        const result = dotenv_1.config();
        if (!process.env.NODE_ENV) {
            throw new Error('ENV NODE_ENV is required');
        }
        if (result.error) {
            let error = result.error;
            if (error.code && error.code !== 'ENOENT') {
                throw error;
            }
        }
        if (!process.env.PORT) {
            throw new Error('ENV PORT is required');
        }
        if (!process.env.SESSION) {
            throw new Error('ENV SESSION is required');
        }
        this.controllers = controllers;
        this.sessionConfig = JSON.parse(process.env.SESSION);
        this.app = express_1.default();
        this.initializeMiddlewares();
        this.initializeControllers();
    }
    static getInstance(controllers) {
        if (!App.instance) {
            App.instance = new App(controllers);
        }
        return App.instance;
    }
    initializeMiddlewares() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(method_override_1.default((req, res) => {
            if (req.body._method) {
                var method = req.body._method;
                delete req.body._method;
                return method;
            }
            return req.method;
        }));
        this.app.use(express_session_1.default(this.sessionConfig));
    }
    initializeControllers() {
        this.controllers.forEach(controller => {
            this.app.use('/', controller.router);
        });
    }
    runControllersOnAppStart() {
        this.controllers.forEach(controller => {
            if (typeof controller.onAppStart == 'function') {
                controller.onAppStart();
            }
        });
    }
    run() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}...`);
            this.runControllersOnAppStart();
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map