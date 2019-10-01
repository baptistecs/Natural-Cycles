"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = __importDefault(require("../tool/env"));
class Firebase {
    constructor(parentPath) {
        let serviceAccount = require('../../config/development/firebase.json');
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            databaseURL: 'https://natural-cycles-1.firebaseio.com/',
        });
        this.ref = firebase_admin_1.default.database().ref(parentPath);
    }
    static getInstance(parentPath = env_1.default) {
        if (!Firebase.instance) {
            Firebase.instance = new Firebase(parentPath);
        }
        return Firebase.instance;
    }
    addReferenceListener(childPath, callback, event = 'child_added') {
        this.ref.child(childPath).on(event, snapshot => {
            if (snapshot) {
                callback(snapshot.key, snapshot.val());
            }
        });
    }
    getFirstObjectByChildProperty(childPath, property, value) {
        return this.ref
            .child(childPath)
            .orderByChild(property)
            .equalTo(value)
            .limitToFirst(1)
            .once('value');
    }
    setObject(childPath, key, data) {
        return this.ref.child(childPath + '/' + key).set(data);
    }
    removeObject(childPath, key) {
        return this.ref.child(childPath + '/' + key).remove();
    }
    pushObject(childPath, data) {
        this.ref
            .child(childPath)
            .push(data)
            .then(result => {
            console.log(childPath + ' added on this node: ' + result.key);
        })
            .catch(reason => {
            throw new Error(reason);
        });
    }
}
exports.default = Firebase;
//# sourceMappingURL=firebase.js.map