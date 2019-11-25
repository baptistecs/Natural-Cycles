"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const home_controller_1 = __importDefault(require("./controller/home-controller"));
const user_controller_1 = __importDefault(require("./controller/user-controller"));
app_1.default.init();
const userController = new user_controller_1.default();
const app = app_1.default.getInstance([
    new home_controller_1.default(userController.list),
    userController,
]);
app.run();
//# sourceMappingURL=index.js.map