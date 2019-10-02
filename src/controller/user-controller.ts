import ControllerInterface from '../interface/controller'
import Express from 'express'
import { default as Firebase, EventType } from '../tool/firebase'
import User from '../model/user'
import UserCollection from '../interface/user-collection'
import Blake2b from '../tool/blake2b'
import { htmlEntities } from '../tool/string'

class UserController implements ControllerInterface {
  readonly path: string = '/user'
  router: Express.Router = Express.Router()
  private static users: UserCollection = {}
  private static loadingForced = false

  constructor() {
    this.intializeRoutes()
  }

  intializeRoutes() {
    this.router
      .get(this.path + '/list', this.list) // display the list of the users + new user button
      .get(this.path, this.displayForm) // display the form (create / update)
      .post(this.path, this.create) // create a new user
      .get(this.path + '/:user_id', this.read) // display specific user
      .put(this.path + '/:user_id', this.update) // update specific user
      .delete(this.path + '/:user_id', this.delete) // delete specific user
      .get(this.path + '/:user_id/edit', this.displayForm) // display specific user form for update
  }

  onAppStart() {
    this.addRealtimeDatabaseUserListeners()
  }

  addRealtimeDatabaseUserListeners() {
    let db = Firebase.getInstance()
    // value EventType sends all users, child_* sends user by user.
    let eventTypes: EventType[] = ['child_added', 'child_changed']

    // adds & updates
    eventTypes.forEach(eventType => {
      db.addReferenceListener(
        'user',
        (userId: string, userVal: any) => {
          if (!userVal.id || !userVal.email) {
            console.error(
              "User from RTDB doesn't have the required parameters: ",
              userId,
              userVal,
            )
            return
          }
          let user = new User(userVal.email, userVal.id)
          UserController.addOrUpdateUser(user) // better way to cast directly in the parameter?
        },
        eventType,
      )
    })

    // deletion
    db.addReferenceListener(
      'user',
      (userId: string, userVal: any) => {
        if (!UserController.users[userId]) {
          console.error(
            'userId from RTDB not found on this node for deletion: ',
            userId,
            userVal,
          )
          return
        }
        delete UserController.users[userId]
      },
      'child_removed',
    )

    console.log('Listening users from the database...')
  }

  create = async (req: Express.Request, res: Express.Response) => {
    const sess: any = req.session
    let email = req.body.email
    let user: User
    let db: Firebase
    let errorCode = 400 // Bad Request

    if (!email) {
      let message = 'Email is required for user creation'
      console.error(message)
      res.status(400).json({ error: true, message: message })
      return
    }

    try {
      // small perf improvement: better to exec regex + toLowerCase twice than
      // to generate a hash for nothing (to be tested though...)
      if (!User.checkEmail(email)) {
        User.throwEmailError(email)
      }

      // WARN: hash generated must be done with the formated email in order to
      // ease the unicity check
      let emailFormated = User.emailFormat(email)
      let userId = ''

      Blake2b.getInstance()
        .getDigest(emailFormated)
        .then(digest => {
          let userExist = UserController.users[digest]
          // test if user already exist by id
          if (userExist) {
            errorCode = 409 // conflict
            if (userExist.getEmail() == emailFormated) {
              console.log(emailFormated)
              throw new Error('An account already exists with this email')
            } else {
              console.log(emailFormated + ' ' + userExist.getId())
              throw new Error(`An account have been created with this email and
                the email have been updated. Please update the email in the
                existing account if needed.`)
            }
          }

          userId = digest

          // test if user exists in database by email having an old ID (from a previous email)
          db = Firebase.getInstance()
          return db.getFirstObjectByChildProperty(
            'user',
            'email',
            emailFormated,
          )
        })
        .then(userSnapshot => {
          if (userSnapshot.exists()) {
            errorCode = 409 // conflict
            console.log(emailFormated)
            // let dbUser = userSnapshot.exportVal()
            // let key = Object.keys(dbUser)[0]
            throw new Error('An account already exists with this email')
          }

          user = new User(email, userId)

          return db.setObject('user', user.getId(), user)
        })
        .then(
          () => {
            // quick update on this node so we don't wait for db notif, hoping that
            // the load balancer is setup so it keep clients on the same node
            UserController.users[user.getId()] = user

            if (req.body._redirect) {
              sess.successMessage = 'User created successfully'
              res.redirect(
                this.path + '/' + encodeURIComponent(user.getId()) + '/edit',
              )
            } else {
              // 201 created
              res.status(201).json({
                error: false,
                message: 'User created successfully',
                user: user,
              })
            }
          },
          reason => {
            console.error(reason)

            if (req.body._redirect) {
              sess.errorMessage = reason.toString()
              res.redirect(this.path + '?email=' + encodeURIComponent(email))
            } else {
              // internal server error
              res.status(500).json({
                error: true,
                message: reason.toString(),
              })
            }
          },
        )
    } catch (userError) {
      console.error(userError)

      if (req.body._redirect) {
        sess.errorMessage = userError.toString()
        res.redirect(this.path + '?email=' + encodeURIComponent(email))
      } else {
        res
          .status(errorCode)
          .json({ error: true, message: userError.toString() })
      }
    }
  }

  read = async (req: Express.Request, res: Express.Response) => {
    if (!req.params.user_id) {
      let message = 'User ID is required for user read'
      console.error(message)
      res.status(400).json({ error: true, message: message })
      return
    }

    if (!UserController.users[req.params.user_id]) {
      let message = 'User not found (read)'
      console.error(message)
      res.status(404).json({ error: true, message: message })
      return
    }

    res.status(200).json({
      error: false,
      message: 'User read successfully',
      user: UserController.users[req.params.user_id],
    })
  }

  update = async (req: Express.Request, res: Express.Response) => {
    const sess: any = req.session

    if (!req.params.user_id) {
      let message = 'User ID is required for user update'
      console.error(message)
      res.status(400).json({ error: true, message: message })
      return
    }

    if (!req.body.email) {
      let message = 'User email is required for user update'
      console.error(message)
      res.status(400).json({ error: true, message: message })
      return
    }

    if (!UserController.users[req.params.user_id]) {
      let message = 'User not found (update)'
      console.error(message)
      res.status(404).json({ error: true, message: message })
      return
    }

    try {
      let currentUser = UserController.users[req.params.user_id],
        user = new User(currentUser.getEmail(), currentUser.getId()) // object cloning

      user.setEmail(req.body.email)

      let db = Firebase.getInstance()

      db.setObject('user', user.getId(), user).then(
        () => {
          // quick update on this node so we don't wait for db notif, hoping that
          // the load balancer is setup so it keep clients on the same node
          UserController.users[req.params.user_id] = user

          if (req.body._redirect) {
            sess.successMessage = 'User updated successfully'
            res.redirect(
              this.path + '/' + encodeURIComponent(user.getId()) + '/edit',
            )
          } else {
            res.status(200).json({
              error: false,
              message: 'User updated successfully',
              user: user,
            })
          }
        },
        reason => {
          console.error(reason)

          if (req.body._redirect) {
            sess.errorMessage = reason.toString()
            res.redirect(
              this.path +
                '/' +
                encodeURIComponent(req.params.user_id) +
                '/edit',
            )
          } else {
            res.status(500).json({
              error: true,
              message: reason.toString(),
            })
          }
        },
      )
    } catch (userError) {
      console.error(userError)

      if (req.body._redirect) {
        sess.errorMessage = userError.toString()
        res.redirect(
          this.path + '/' + encodeURIComponent(req.params.user_id) + '/edit',
        )
      } else {
        res.status(400).json({ error: true, message: userError.toString() })
      }
    }
  }

  delete = async (req: Express.Request, res: Express.Response) => {
    const sess: any = req.session

    if (!req.params.user_id) {
      let message = 'User ID is required for user deletion'
      console.error(message)
      res.status(400).json({ error: true, message: message })
      return
    }

    if (!UserController.users[req.params.user_id]) {
      let message = 'User not found (deletion)'
      console.error(message)
      res.status(404).json({ error: true, message: message })
      return
    }

    try {
      let user = UserController.users[req.params.user_id]
      let db = Firebase.getInstance()

      db.removeObject('user', user.getId()).then(
        () => {
          // quick update on this node so we don't wait for db notif, hoping that
          // the load balancer is setup so it keep clients on the same node
          delete UserController.users[req.params.user_id]

          if (req.body._redirect) {
            sess.successMessage = 'User deleted successfully'
            res.redirect(this.path + '/list')
          } else {
            res.status(204).json({
              error: false,
              message: 'User deleted successfully',
              user: user,
            })
          }
        },
        reason => {
          console.error(reason)

          if (req.body._redirect) {
            sess.errorMessage = reason.toString()
            res.redirect(this.path + '/list')
          } else {
            res.status(500).json({
              error: true,
              message: reason.toString(),
            })
          }
        },
      )
    } catch (userError) {
      console.error(userError)

      if (req.body._redirect) {
        sess.errorMessage = userError.toString()
        res.redirect(this.path + '/list')
      } else {
        res.status(400).json({ error: true, message: userError.toString() })
      }
    }
  }

  list = async (req: Express.Request, res: Express.Response) => {
    let users = UserController.getUsers()

    // we force user data load
    if (!UserController.loadingForced && !Object.keys(users).length) {
      console.log('User list loading forced (not great)')
      UserController.loadingForced = true
      let db = Firebase.getInstance()
      db.getAll('user')
        .then(snapshot => {
          let usersData: UserCollection = snapshot.val()
          let userVal: any

          for (let userId in usersData) {
            userVal = usersData[userId]
            if (!userVal.id || !userVal.email) {
              console.error(
                "User from RTDB doesn't have the required parameters: ",
                userId,
                userVal,
              )
            }
            let user = new User(userVal.email, userVal.id)
            UserController.addOrUpdateUser(user) // better way to cast directly in the parameter?
          }
        })
        .then(() => {
          users = UserController.getUsers()
          res.send(this.generateHtmlFromUserList(users))
        })
    } else {
      res.send(this.generateHtmlFromUserList(users))
    }
  }

  generateHtmlFromUserList = (users: UserCollection): string => {
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
          <h1>User list</h1>
          <table>
          <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
          <tbody>`

    if (Object.keys(users).length) {
      for (let userId in users) {
        html += `<tr>
      <td>${htmlEntities(userId)}</td>
      <td>${htmlEntities(users[userId].getEmail())}</td>
      <td>
        <a href="${this.path}/${encodeURIComponent(userId)}/edit">Edit</a>
      </td>
    </tr>\n`
      }
    } else {
      html += `<tr><td colspan="3">No user yet, please add one!</td></tr>`
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
    </html>`

    return html
  }

  displayForm = async (req: Express.Request, res: Express.Response) => {
    const sess: any = req.session
    let userId = req.params.user_id || '',
      userEmail = '',
      errorHtml = '',
      successHtml = '',
      deleteForm = ''

    if (sess.successMessage) {
      successHtml += `<b class="success">${htmlEntities(
        sess.successMessage,
      )}</b>\n`
      delete sess.successMessage
    }

    if (sess.errorMessage) {
      errorHtml += `<b class="error">${htmlEntities(sess.errorMessage)}</b>\n`
      delete sess.errorMessage
    }

    if (userId) {
      try {
        userEmail = UserController.getUser(req.params.user_id).getEmail()
      } catch (userError) {
        console.error(userError)
        errorHtml += `<b class="error">${htmlEntities(userError)}</b><br>\n`
      }

      deleteForm = `
        <form action="${this.path}/${encodeURIComponent(
        req.params.user_id,
      )}" method="post"
          onsubmit="return confirm('Confirm the deletion?')"
          style="max-width:400px;margin:auto">
          <input type="hidden" name="_method" value="DELETE">
          <input type="hidden" name="_redirect" value="1">
          <button>Delete</button>
        </form>\n`
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
          ${successHtml + errorHtml}
          <form method="post"
            action="${this.path}${
      userId ? '/' + encodeURIComponent(req.params.user_id) : ''
    }">
            ${userId ? `<input type="hidden" name="_method" value="PUT">` : ''}
            <input type="hidden" name="_redirect" value="1">
            <fieldset>
              <legend>User</legend>
              <label for="email">Email</label>
              <input id="email" type="email" name="email"
                ${
                  userId
                    ? ' value="' + htmlEntities(userEmail) + '"'
                    : req.query.email
                    ? ' value="' + htmlEntities(req.query.email) + '"'
                    : ''
                }>
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
      </html>`)
  }

  // SETTERS & GETTERS

  static getUsers() {
    return UserController.users
  }

  static getUser(id: string) {
    if (!UserController.users[id]) {
      throw new Error('No user with this id: ' + JSON.stringify(id))
    }
    return UserController.users[id]
  }

  static addOrUpdateUser(user: User) {
    if (!user.getId()) {
      throw new Error('User id is required')
    }
    UserController.users[user.getId()] = user
  }
}

export default UserController
