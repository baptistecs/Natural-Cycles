import Express from 'express'
import ControllerInterface from './interface/controller'

class App {
  public app: Express.Application
  public port: number

  constructor(controllers: ControllerInterface[], port: number) {
    this.app = Express()
    this.port = port

    this.initializeMiddlewares()
    this.initializeControllers(controllers)
  }

  private initializeMiddlewares() {
    this.app.use(Express.json()) // to support JSON-encoded bodies
    this.app.use(Express.urlencoded({ extended: true })) // to support URL-encoded bodies
  }

  private initializeControllers(controllers: ControllerInterface[]) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router)
    })
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`)
    })
  }
}

export default App
