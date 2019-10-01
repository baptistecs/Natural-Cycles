import Express from 'express'
import ControllerInterface from './interface/controller'
import Session, { SessionOptions } from 'express-session'
import MethodOverride from 'method-override'
import { config as DotENV } from 'dotenv'

class App {
  private static instance: App
  public app: Express.Application
  private sessionConfig: SessionOptions
  private controllers: ControllerInterface[]

  private constructor(controllers: ControllerInterface[]) {
    DotENV() // generate environment variable from .env file

    if (!process.env.NODE_ENV) {
      throw new Error('ENV NODE_ENV is required')
    }

    if (!process.env.PORT) {
      throw new Error('ENV PORT is required')
    }

    if (!process.env.SESSION) {
      throw new Error('ENV SESSION is required')
    }

    this.controllers = controllers
    this.sessionConfig = JSON.parse(process.env.SESSION)
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
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}...`)
      this.runControllersOnAppStart()
    })
  }
}

export default App
