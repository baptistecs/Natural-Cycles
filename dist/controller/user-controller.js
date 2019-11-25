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
const express_1 = __importDefault(require("express"));
const firebase_1 = __importDefault(require("../tool/firebase"));
const user_1 = __importDefault(require("../model/user"));
const blake2b_1 = __importDefault(require("../tool/blake2b"));
const string_1 = require("../tool/string");
class UserController {
    constructor() {
        this.path = '/user';
        this.router = express_1.default.Router();
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const sess = req.session;
            let email = req.body.email;
            let user;
            let db;
            let errorCode = 400;
            if (!email) {
                let message = 'Email is required for user creation';
                console.error(message);
                res.status(400).json({ error: true, message: message });
                return;
            }
            try {
                if (!user_1.default.checkEmail(email)) {
                    user_1.default.throwEmailError(email);
                }
                let emailFormated = user_1.default.emailFormat(email);
                let userId = '';
                const digest = yield blake2b_1.default.getInstance().getDigest(emailFormated);
                let userExist = UserController.users[digest];
                if (userExist) {
                    errorCode = 409;
                    if (userExist.getEmail() == emailFormated) {
                        console.log(emailFormated);
                        throw new Error('An account already exists with this email');
                    }
                    else {
                        console.log(emailFormated + ' ' + userExist.getId());
                        throw new Error(`An account have been created with this email and
            the email have been updated. Please update the email in the
            existing account if needed.`);
                    }
                }
                userId = digest;
                db = firebase_1.default.getInstance();
                const userSnapshot = yield db.getFirstObjectByChildProperty('user', 'email', emailFormated);
                if (userSnapshot.exists()) {
                    errorCode = 409;
                    console.log(emailFormated);
                    throw new Error('An account already exists with this email');
                }
                user = new user_1.default(email, userId);
                UserController.users[user.getId()] = user;
                db.setObject('user', user.getId(), user);
                if (req.body._redirect) {
                    sess.successMessage = 'User created successfully';
                    res.redirect(this.path + '/' + encodeURIComponent(user.getId()) + '/edit');
                }
                else {
                    res.status(201).json({
                        error: false,
                        message: 'User created successfully',
                        user: user,
                    });
                }
            }
            catch (userError) {
                console.error(userError);
                if (req.body._redirect) {
                    sess.errorMessage = userError.toString();
                    res.redirect(this.path + '?email=' + encodeURIComponent(email));
                }
                else {
                    res
                        .status(errorCode)
                        .json({ error: true, message: userError.toString() });
                }
            }
        });
        this.read = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.params.user_id) {
                let message = 'User ID is required for user read';
                console.error(message);
                res.status(400).json({ error: true, message: message });
                return;
            }
            if (!UserController.users[req.params.user_id]) {
                let message = 'User not found (read)';
                console.error(message);
                res.status(404).json({ error: true, message: message });
                return;
            }
            res.status(200).json({
                error: false,
                message: 'User read successfully',
                user: UserController.users[req.params.user_id],
            });
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const sess = req.session;
            if (!req.params.user_id) {
                let message = 'User ID is required for user update';
                console.error(message);
                res.status(400).json({ error: true, message: message });
                return;
            }
            if (!req.body.email) {
                let message = 'User email is required for user update';
                console.error(message);
                res.status(400).json({ error: true, message: message });
                return;
            }
            if (!UserController.users[req.params.user_id]) {
                let message = 'User not found (update)';
                console.error(message);
                res.status(404).json({ error: true, message: message });
                return;
            }
            try {
                let currentUser = UserController.users[req.params.user_id], user = new user_1.default(currentUser.getEmail(), currentUser.getId());
                user.setEmail(req.body.email);
                UserController.users[req.params.user_id] = user;
                firebase_1.default.getInstance().setObject('user', user.getId(), user);
                if (req.body._redirect) {
                    sess.successMessage = 'User updated successfully';
                    res.redirect(this.path + '/' + encodeURIComponent(user.getId()) + '/edit');
                }
                else {
                    res.status(200).json({
                        error: false,
                        message: 'User updated successfully',
                        user: user,
                    });
                }
            }
            catch (userError) {
                console.error(userError);
                if (req.body._redirect) {
                    sess.errorMessage = userError.toString();
                    res.redirect(this.path + '/' + encodeURIComponent(req.params.user_id) + '/edit');
                }
                else {
                    res.status(400).json({ error: true, message: userError.toString() });
                }
            }
        });
        this.delete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const sess = req.session;
            if (!req.params.user_id) {
                let message = 'User ID is required for user deletion';
                console.error(message);
                res.status(400).json({ error: true, message: message });
                return;
            }
            if (!UserController.users[req.params.user_id]) {
                let message = 'User not found (deletion)';
                console.error(message);
                res.status(404).json({ error: true, message: message });
                return;
            }
            try {
                let user = UserController.users[req.params.user_id];
                let db = firebase_1.default.getInstance();
                delete UserController.users[req.params.user_id];
                db.removeObject('user', user.getId());
                if (req.body._redirect) {
                    sess.successMessage = 'User deleted successfully';
                    res.redirect(this.path + '/list');
                }
                else {
                    res.status(204).json({
                        error: false,
                        message: 'User deleted successfully',
                        user: user,
                    });
                }
            }
            catch (userError) {
                console.error(userError);
                if (req.body._redirect) {
                    sess.errorMessage = userError.toString();
                    res.redirect(this.path + '/list');
                }
                else {
                    res.status(400).json({ error: true, message: userError.toString() });
                }
            }
        });
        this.list = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let users = UserController.getUsers();
            if (!UserController.onAppStartInitialized) {
                this.onAppStart();
                console.log('User list loading forced (not great)');
                let db = firebase_1.default.getInstance();
                const snapshot = yield db.getAll('user');
                let usersData = snapshot.val();
                let userVal;
                for (let userId in usersData) {
                    userVal = usersData[userId];
                    if (!userVal.id || !userVal.email) {
                        console.error("User from RTDB doesn't have the required parameters: ", userId, userVal);
                    }
                    let user = new user_1.default(userVal.email, userVal.id);
                    UserController.addOrUpdateUser(user);
                }
                users = UserController.getUsers();
            }
            let flashMessages = this.getFlashMessages(req);
            res.send(this.generateHtmlFromUserList(users, flashMessages));
        });
        this.generateHtmlFromUserList = (users, flashMessages) => {
            let html = `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Natural Cycles - User</title>
        <style type="text/css">
          a{text-decoration:none;color:royalblue}
          a:hover{text-decoration:underline}
          .warning{margin-bottom:5px;display:block;color:orange}
          #user-list{display:table;margin:auto;padding:0 20px}
          #user-list table{border-collapse:collapse;margin:0 auto 20px}
          #user-list td{border:1px solid black;padding:0 5px}
          </style>
      </head>
      <body>
        <section id="user-list">
          ${flashMessages}
          <h1>User list</h1>
          <table>
          <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
          <tbody>`;
            if (Object.keys(users).length) {
                for (let userId in users) {
                    html += `<tr>
      <td>${string_1.htmlEntities(userId)}</td>
      <td>${string_1.htmlEntities(users[userId].getEmail())}</td>
      <td>
        <a href="${this.path}/${encodeURIComponent(userId)}/edit">Edit</a>
      </td>
    </tr>\n`;
                }
            }
            else {
                html += `<tr><td colspan="3">No user yet, please add one!</td></tr>`;
            }
            html += `<tr>
                <td colspan="3" align="center" style="padding:5px 0 10px 0">
                  <a href="${this.path}">Add a new user</a>
                </td>
              </tr>
            </tbody>
          </table>\n
        </section>
      </body>
    </html>`;
            return html;
        };
        this.displayForm = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let userId = req.params.user_id || '', userEmail = '', deleteForm = '', flashMessages = this.getFlashMessages(req);
            if (userId) {
                try {
                    userEmail = UserController.getUser(req.params.user_id).getEmail();
                }
                catch (userError) {
                    console.error(userError);
                    flashMessages += `<b class="error">${string_1.htmlEntities(userError)}</b><br>\n`;
                }
                deleteForm = `
        <form action="${this.path}/${encodeURIComponent(req.params.user_id)}" method="post"
          onsubmit="return confirm('Confirm the deletion?')"
          style="max-width:400px;margin:auto">
          <input type="hidden" name="_method" value="DELETE">
          <input type="hidden" name="_redirect" value="1">
          <button>Delete</button>
        </form>\n`;
            }
            res.send(`<!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Natural Cycles - User</title>
        <style type="text/css">
          a{text-decoration:none;color:royalblue}
          a:hover{text-decoration:underline}
          form{max-width:400px;margin:0 auto 5px}
          button{float:right}
          .success{margin-bottom:5px;display:block;color:green}
          .error{margin-bottom:5px;display:block;color:red}
          .actions{display:block;text-align:center;padding-top:10px}
          #user-list{max-width:400px;margin:auto;padding:0 20px 10px;border:1px solid black}
        </style>
      </head>
      <body>
        <section id="user-list">
          <h1>User ${userId ? 'update' : 'creation'}</h1>
          ${flashMessages}
          <form method="post"
            action="${this.path}${userId ? '/' + encodeURIComponent(req.params.user_id) : ''}">
            ${userId ? `<input type="hidden" name="_method" value="PUT">` : ''}
            <input type="hidden" name="_redirect" value="1">
            <fieldset>
              <legend>User</legend>
              <label for="email">Email</label>
              <input id="email" type="email" name="email"
                ${userId
                ? ' value="' + string_1.htmlEntities(userEmail) + '"'
                : req.query.email
                    ? ' value="' + string_1.htmlEntities(req.query.email) + '"'
                    : ''}>
              <button>${userId ? 'Update' : 'Create'}</button>
            </fieldset>
          </form>
          ${deleteForm}
          <div class="actions">
            <a href="${this.path}/list">User list</a>
            ${userId ? `- <a href="${this.path}">Add a new user</a>` : ''}
          </div>
        </section>
      </body>
      </html>`);
        });
        console.log('UserController constructor');
        this.intializeRoutes();
        this.onAppStart();
    }
    intializeRoutes() {
        this.router
            .get(this.path + '/list', this.list)
            .get(this.path, this.displayForm)
            .post(this.path, this.create)
            .get(this.path + '/:user_id', this.read)
            .put(this.path + '/:user_id', this.update)
            .delete(this.path + '/:user_id', this.delete)
            .get(this.path + '/:user_id/edit', this.displayForm);
    }
    onAppStart() {
        if (UserController.onAppStartInitialized) {
            return;
        }
        UserController.onAppStartInitialized = true;
        console.log('UserController onAppStart loaded');
        this.addRealtimeDatabaseUserListeners();
    }
    addRealtimeDatabaseUserListeners() {
        let db = firebase_1.default.getInstance();
        let eventTypes = ['child_added', 'child_changed'];
        eventTypes.forEach(eventType => {
            db.addReferenceListener('user', (userId, userVal) => {
                if (!userVal.id || !userVal.email) {
                    console.error("User from RTDB doesn't have the required parameters: ", userId, userVal);
                    return;
                }
                let user = new user_1.default(userVal.email, userVal.id);
                UserController.addOrUpdateUser(user);
            }, eventType);
        });
        db.addReferenceListener('user', (userId, userVal) => {
            if (UserController.users[userId]) {
                delete UserController.users[userId];
            }
        }, 'child_removed');
        console.log('Listening users from the database...');
    }
    getFlashMessages(req) {
        const sess = req.session;
        let html = '';
        if (sess.successMessage) {
            html += `<b class="success">${string_1.htmlEntities(sess.successMessage)}</b>\n`;
            delete sess.successMessage;
        }
        if (sess.errorMessage) {
            html += `<b class="error">${string_1.htmlEntities(sess.errorMessage)}</b>\n`;
            delete sess.errorMessage;
        }
        return html;
    }
    static getUsers() {
        return UserController.users;
    }
    static getUser(id) {
        if (!UserController.users[id]) {
            throw new Error('No user with this id: ' + JSON.stringify(id));
        }
        return UserController.users[id];
    }
    static addOrUpdateUser(user) {
        if (!user.getId()) {
            throw new Error('User id is required');
        }
        UserController.users[user.getId()] = user;
    }
}
UserController.users = {};
UserController.onAppStartInitialized = false;
exports.default = UserController;
//# sourceMappingURL=user-controller.js.map