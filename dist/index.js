"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const hello_world_controller_1 = __importDefault(require("./controller/hello-world-controller"));
const port = 8080;
const app = new app_1.default([new hello_world_controller_1.default()], port);
app.listen();
//# sourceMappingURL=index.js.map