"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const method_override_1 = __importDefault(require("method-override"));
const env_1 = __importDefault(require("./tool/env"));
class App {
    constructor(controllers) {
        this.controllers = controllers;
        this.appConfig = require('../config/' + env_1.default + '/app.json');
        this.sessionConfig = require('../config/' + env_1.default + '/session.json');
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
        this.app.listen(this.appConfig.port, () => {
            console.log(`App listening on the port ${this.appConfig.port}...`);
            this.runControllersOnAppStart();
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map