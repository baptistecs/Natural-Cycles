"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
class HelloWorldController {
    constructor() {
        this.path = '/';
        this.router = express_1.default.Router();
        this.displayMessage = (req, res) => {
            res.send(HelloWorldController.message);
        };
        this.intializeRoutes();
    }
    intializeRoutes() {
        this.router.get(this.path, this.displayMessage);
    }
}
HelloWorldController.message = 'Hello world!';
exports.default = HelloWorldController;
//# sourceMappingURL=hello-world-controller.js.map