import ControllerInterface from '../interface/controller'
import Express from 'express'
import UserController from './user-controller'

class HomeController implements ControllerInterface {
  readonly path: string = '/'
  router: Express.Router = Express.Router()

  constructor(userController: UserController) {
    this.router.get(this.path, userController.render)
  }
}

export default HomeController
