import ControllerInterface from '../interface/controller'
import Express from 'express'

class HomeController implements ControllerInterface {
  readonly path: string = '/'
  router: Express.Router = Express.Router()

  constructor(requestHandler: Express.RequestHandler) {
    this.router.get(this.path, requestHandler)
  }
}

export default HomeController
