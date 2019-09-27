import ControllerInterface from '../interface/controller'
import Express from 'express'
import { default as Firebase, EventType } from '../tool/firebase'
import User from '../model/user'
import UserCollection from '../interface/user-collection'
import ENV from '../tool/env'
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
    let db = Firebase.getInstance(ENV)
    let eventTypes: EventType[] = [
      // 'value', // sends a bunch of users
      'child_added', // sends user by user
      'child_changed', // sends user by user
      // 'child_moved', // sends user by user // when sorted
      // 'child_removed', // sends user by user
    ]

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

    if (!req.body.email) {
      let message = 'Email is required for user creation'
      console.error(message)
      res.status(400).json({ error: true, message: message })
      return
    }

    try {
      let user = new User(req.body.email)
      let rtdb = Firebase.getInstance(ENV)

      rtdb.setObject('user', user.getId(), user).then(
        () => {
          // quick update on this node so we don't wait for db notif, hoping that
          // the load balancer is setup so it keep clients on the same node
          UserController.users[user.getId()] = user

          if (req.body._redirect) {
            sess.successMessage = 'User created successfully'
            res.redirect(this.path + '/' + user.getId() + '/edit')
          } else {
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
            res.redirect(
              this.path + '?email=' + encodeURIComponent(req.body.email),
            )
          } else {
            res.status(500).json({
              error: true,
              message: reason,
            })
          }
        },
      )
    } catch (userError) {
      console.error(userError)

      if (req.body._redirect) {
        sess.errorMessage = userError.toString()
        res.redirect(this.path + '?email=' + encodeURIComponent(req.body.email))
      } else {
        res.status(400).json({ error: true, message: userError.toString() })
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

      let rtdb = Firebase.getInstance(ENV)

      rtdb.setObject('user', user.getId(), user).then(
        () => {
          // quick update on this node so we don't wait for db notif, hoping that
          // the load balancer is setup so it keep clients on the same node
          UserController.users[req.params.user_id] = user

          if (req.body._redirect) {
            sess.successMessage = 'User updated successfully'
            res.redirect(this.path + '/' + user.getId() + '/edit')
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
            res.redirect(this.path + '/' + req.params.user_id + '/edit')
          } else {
            res.status(500).json({
              error: true,
              message: reason,
            })
          }
        },
      )
    } catch (userError) {
      console.error(userError)

      if (req.body._redirect) {
        sess.errorMessage = userError.toString()
        res.redirect(this.path + '/' + req.params.user_id + '/edit')
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
      let rtdb = Firebase.getInstance(ENV)

      rtdb.removeObject('user', user.getId()).then(
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
              message: reason,
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
    // let nbUser = Object.keys(users).length
    // res.setHeader('Content-Type', 'text/html; charset=utf-8') // only needed with res.write (not with res.send)
    let html = `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Natural Cycles - User</title>
          <style type="text/css">
            a{text-decoration:none;color:royalblue}
            a:hover{text-decoration:underline}
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

    for (let userId in users) {
      html += `<tr>
        <td>${userId}</td>
        <td>${users[userId].getEmail()}</td>
        <td>
          <a href="${this.path}/${encodeURIComponent(userId)}/edit">Edit</a>
        </td>
      </tr>\n`
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

    res.send(html)
  }

  displayForm = async (req: Express.Request, res: Express.Response) => {
    const sess: any = req.session
    let userId = req.params.user_id || '',
      userEmail = '',
      errorHtml = '',
      successHtml = '',
      deleteForm = ''

    if (sess.successMessage) {
      successHtml += `<b class="success">${sess.successMessage}</b>\n`
      delete sess.successMessage
    }

    if (sess.errorMessage) {
      errorHtml += `<b class="error">${sess.errorMessage}</b>\n`
      delete sess.errorMessage
    }

    if (userId) {
      try {
        userEmail = UserController.getUser(req.params.user_id).getEmail()
      } catch (userError) {
        console.error(userError)
        errorHtml += `<b class="error">${userError}</b><br>\n`
      }

      deleteForm = `
        <form action="${this.path}/${req.params.user_id}" method="post"
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
            action="${this.path}${userId ? '/' + req.params.user_id : ''}">
            ${userId ? `<input type="hidden" name="_method" value="PUT">` : ''}
            <input type="hidden" name="_redirect" value="1">
            <fieldset>
              <legend>User</legend>
              <label for="email">Email</label>
              <input id="email" type="email" name="email"
                ${
                  userId
                    ? ' value="' + userEmail + '"'
                    : req.query.email
                    ? ' value="' +
                      req.query.email.replace(/./gm, function(s: any) {
                        return '&#' + s.charCodeAt(0) + ';'
                      }) /* escape for XSS */ +
                      '"'
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
