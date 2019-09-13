import ControllerInterface from '../interface/controller'
import express from 'express'

class HelloWorldController implements ControllerInterface {
  path: string = '/'
  router: express.Router = express.Router()
  static message: string = 'Hello world!'

  constructor() {
    this.intializeRoutes()
  }

  public intializeRoutes() {
    this.router.get(this.path, this.displayMessage)
  }

  displayMessage = (req: express.Request, res: express.Response) => {
    res.send(HelloWorldController.message)
  }
}

export default HelloWorldController
