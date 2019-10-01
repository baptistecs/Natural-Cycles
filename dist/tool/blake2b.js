"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("../tool/env"));
let Blake2b = require('blake2b');
class Blake2bWrapper {
    constructor() {
        this.config = require('../../config/' +
            env_1.default +
            '/blake2b.json');
        this.getDigest = (input, outFormat = 'hex', outLength = Blake2b.BYTES) => __awaiter(this, void 0, void 0, function* () {
            if (Math.round(outLength) !== outLength) {
                console.warn('Blake2b.getHexDigest out parameter number must be an interger');
                outLength = Math.round(outLength);
            }
            if (outLength < Blake2b.BYTES_MIN || outLength > Blake2b.BYTES_MAX) {
                outLength = Blake2b.BYTES;
                console.warn(`Blake2b.getHexDigest out parameter must be between ${Blake2b.BYTES_MIN} & ${Blake2b.BYTES_MAX}`);
            }
            return new Promise((resolve, reject) => {
                try {
                    let inputBuffer = Buffer.from(input);
                    let hash = Blake2b(outLength, this.key, this.salt);
                    hash = hash.update(inputBuffer);
                    let digest = hash.digest(outFormat);
                    resolve(digest);
                }
                catch (error) {
                    console.log(error);
                    reject(error.toString());
                }
            });
        });
        this.key = Buffer.from(this.config.key);
        if (this.key.length > Blake2b.KEYBYTES_MAX) {
            throw new Error('Key must be between ' +
                Blake2b.KEYBYTES_MIN +
                ' & ' +
                Blake2b.KEYBYTES_MAX +
                ' bytes long');
        }
        this.salt = Buffer.from(this.config.salt);
        if (this.key.length > Blake2b.KEYBYTES_MAX) {
            throw new Error('Salt must be exactly ' + Blake2b.SALTBYTES + ' bytes long');
        }
    }
    static getInstance() {
        if (!Blake2bWrapper.instance) {
            Blake2bWrapper.instance = new Blake2bWrapper();
        }
        return Blake2bWrapper.instance;
    }
}
exports.default = Blake2bWrapper;
//# sourceMappingURL=blake2b.js.map