"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("../tool/validator"));
class User {
    constructor(email, id) {
        this.setEmail(email);
        if (id) {
            this.setId(id);
        }
        else {
            this.setId(this.getEmail());
        }
    }
    getId() {
        return this.id;
    }
    setId(id) {
        this.id = User.idFormat(id);
        return this;
    }
    getEmail() {
        return this.email;
    }
    setEmail(email) {
        if (!User.checkEmail(email)) {
            User.throwEmailError(email);
        }
        this.email = User.emailFormat(email);
        return this;
    }
    static emailFormat(email) {
        return email.toLowerCase();
    }
    static idFormat(id) {
        return id
            .replace(/\./g, '_dot_')
            .replace(/#/g, '_diese_')
            .replace(/\$/g, '_dollar_')
            .replace(/\//g, '_slash_')
            .replace(/\[/g, '_obracket_')
            .replace(/\]/g, '_cbracket_');
    }
    static checkEmail(email) {
        return validator_1.default.isEmail(User.emailFormat(email));
    }
    static throwEmailError(email) {
        throw new Error('Invalid email address ' + JSON.stringify(email));
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map