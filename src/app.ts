import Express from 'express'
import ControllerInterface from './interface/controller'
import AppConfig from './interface/app-config'
import Session, { SessionOptions } from 'express-session'

class App {
  public app: Express.Application
  private appConfig: AppConfig
  private sessionConfig: SessionOptions

  constructor(controllers: ControllerInterface[]) {
    const ENV = process.env.NODE_ENV || 'development' // this.app.get('env')

    this.appConfig = require('../config/' + ENV + '/app.json')
    this.sessionConfig = require('../config/' + ENV + '/session.json')

    this.app = Express()

    this.initializeMiddlewares()
    this.initializeControllers(controllers)
  }

  private initializeMiddlewares() {
    this.app.use(Express.json()) // to support JSON-encoded bodies
    this.app.use(Express.urlencoded({ extended: true })) // to support URL-encoded bodies
    this.app.use(Session(this.sessionConfig))
  }

  private initializeControllers(controllers: ControllerInterface[]) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router)
    })
  }

  public run() {
    this.app.listen(this.appConfig.port, () => {
      console.log(`App listening on the port ${this.appConfig.port}`)
    })
  }
}

export default App
