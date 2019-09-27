import Express from 'express'
import ControllerInterface from './interface/controller'
import AppConfig from './interface/app-config'
import Session, { SessionOptions } from 'express-session'
import MethodOverride from 'method-override'

class App {
  private static instance: App
  public app: Express.Application
  private appConfig: AppConfig
  private sessionConfig: SessionOptions
  private controllers: ControllerInterface[]

  private constructor(controllers: ControllerInterface[]) {
    this.controllers = controllers
    const ENV = process.env.NODE_ENV || 'development' // this.app.get('env')

    this.appConfig = require('../config/' + ENV + '/app.json')
    this.sessionConfig = require('../config/' + ENV + '/session.json')

    this.app = Express()

    this.initializeMiddlewares()
    this.initializeControllers()
  }

  static getInstance(controllers: ControllerInterface[]): App {
    if (!App.instance) {
      App.instance = new App(controllers)
    }
    return App.instance
  }

  private initializeMiddlewares() {
    this.app.use(Express.json()) // to support JSON-encoded bodies
    this.app.use(Express.urlencoded({ extended: true })) // to support URL-encoded bodies
    this.app.use(
      // override request method (POST/GET + param => POST/GET/PUT/DELETE)
      MethodOverride((req: Express.Request, res: Express.Response): string => {
        if (req.body._method) {
          var method = req.body._method
          delete req.body._method
          return method
        }
        return req.method
      }),
    )
    this.app.use(Session(this.sessionConfig))
  }

  private initializeControllers() {
    this.controllers.forEach(controller => {
      this.app.use('/', controller.router)
    })
  }

  private runControllersOnAppStart() {
    this.controllers.forEach(controller => {
      if (typeof controller.onAppStart == 'function') {
        controller.onAppStart()
      }
    })
  }

  public run() {
    this.app.listen(this.appConfig.port, () => {
      console.log(`App listening on the port ${this.appConfig.port}...`)
      this.runControllersOnAppStart()
    })
  }
}

export default App
