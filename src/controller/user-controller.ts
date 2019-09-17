import ControllerInterface from '../interface/controller'
import Express from 'express'

class UserController implements ControllerInterface {
  readonly path: string = '/user'
  router: Express.Router = Express.Router()

  constructor() {
    this.intializeRoutes()
  }

  public intializeRoutes() {
    this.router
      .get(this.path + '/list', this.render) // display the list of the users + new user button
      .get(this.path, this.render) // display the form (create / update)
      .post(this.path, this.render) // create a new user
      .get(this.path + '/:user_id', this.render) // display specific user
      .put(this.path + '/:user_id', this.render) // update specific user
      .delete(this.path + '/:user_id', this.render) // delete specific user
  }

  render = (req: Express.Request, res: Express.Response) => {
    res.send('User ' + req.method + ' params:' + JSON.stringify(req.params))
  }
}

export default UserController
