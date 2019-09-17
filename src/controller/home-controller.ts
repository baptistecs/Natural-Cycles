import ControllerInterface from '../interface/controller'
import Express from 'express'

class HomeController implements ControllerInterface {
  readonly path: string = '/'
  router: Express.Router = Express.Router()

  constructor() {
    this.router.get(
      this.path,
      (req: Express.Request, res: Express.Response) => {
        res.send('Welcome home')
      },
    )
  }
}

export default HomeController
