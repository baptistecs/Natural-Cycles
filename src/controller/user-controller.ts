import ControllerInterface from '../interface/controller'
import Express from 'express'
import Firebase from '../tool/firebase'
import User from '../model/user'
import UserCollection from '../interface/user-collection'
// import { DocumentReference } from '@google-cloud/firestore'

class UserController implements ControllerInterface {
  readonly path: string = '/user'
  router: Express.Router = Express.Router()
  private static users: UserCollection = {}

  constructor() {
    this.intializeRoutes()
  }

  intializeRoutes() {
    this.router
      .get(this.path + '/list', this.listUsers) // display the list of the users + new user button
      .get(this.path, this.render) // display the form (create / update)
      .post(this.path, this.render) // create a new user
      .get(this.path + '/:user_id', this.render) // display specific user
      .put(this.path + '/:user_id', this.render) // update specific user
      .delete(this.path + '/:user_id', this.render) // delete specific user
  }

  onAppStart() {
    this.addRealtimeDatabaseNewUserListener()
  }

  addRealtimeDatabaseNewUserListener() {
    console.log('Listening for new users...')

    const ENV = process.env.NODE_ENV || 'development' // this.app.get('env')

    Firebase.getInstance(ENV).addReferenceListener(
      'user',
      (userId: string, userVal: any) => {
        if (!userVal.id || !userVal.email) {
          console.error(
            "User from RTDB doesn't have the required parameters: ",
            userVal,
          )
          return
        }
        UserController.addUser(new User(userVal.email, userVal.id)) // better way to cast directly in the parameter?
      },
    )
  }

  listUsers(req: Express.Request, res: Express.Response) {
    let users = UserController.getUsers()
    let nbUser = Object.keys(users).length

    res.setHeader('Content-Type', 'text/html')
    res.write(nbUser + ' user(s)<br>\n')
    for (let userId in users) {
      res.write(userId + ' ' + users[userId].getEmail() + '<br>\n')
    }
    res.end()
  }

  render = async (req: Express.Request, res: Express.Response) => {
    res.send('User ' + req.method + ' params:' + JSON.stringify(req.params))
  }

  displayForm = (req: Express.Request, res: Express.Response) => {
    res.send(`
<form action="${this.path}" method="post">
  <fieldset>
    <legend>Register</legend>
    <input type="email" name="email">
    <button>Ok</button>
  </fieldset>
</form>`)
  }

  // SETTERS & GETTERS

  static getUsers() {
    return UserController.users
  }

  static addUser(user: User) {
    if (!user.getId()) {
      throw new Error('User id is required')
    }
    UserController.users[user.getId()] = user
  }
}

export default UserController
