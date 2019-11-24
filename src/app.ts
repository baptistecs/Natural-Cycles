import Express from 'express'
import ControllerInterface from './interface/controller'
import Session, { SessionOptions } from 'express-session'
import MethodOverride from 'method-override'
import { config as DotENV } from 'dotenv'
import Firebase from './tool/firebase'

class App {
  private static instance: App
  private express: Express.Application
  private sessionConfig!: SessionOptions
  // private controllers!: ControllerInterface[]

  private constructor(controllers: ControllerInterface[]) {
    console.log('App constructor')
    this.express = Express()
    this.initializeMiddlewares()
    this.initializeControllers(controllers)
  }

  static getInstance(controllers: ControllerInterface[]): App {
    if (!App.instance) {
      App.instance = new App(controllers)
    }
    return App.instance
  }

  static init() {
    console.log('App init')
    App.initDotEnv()
    console.log('NODE_ENV=' + process.env.NODE_ENV)
    if (!process.env.PORT) {
      throw new Error('ENV PORT is required')
    }
  }

  private static initDotEnv() {
    /* if (process.env.NODE_ENV === 'production') {
      return // we avoid .env file in prod
    } */
    console.log('DotENV init')
    // const result = require('dotenv').config()
    const result = DotENV() // generate environment variable from .env file
    if (result.error) {
      let error = result.error as any
      if (error.code && error.code !== 'ENOENT' /* file missing error */) {
        throw error
      } else {
        console.info('DotENV no .env file')
      }
    }
    if (!process.env.NODE_ENV) {
      throw new Error('ENV NODE_ENV is required')
    }
  }

  private initSession() {
    console.log('Session init')
    if (!process.env.SESSION) {
      throw new Error('ENV SESSION is required')
    }
    this.sessionConfig = JSON.parse(process.env.SESSION)
    if (process.env.SESSION_STORE_TYPE === 'firestore-store') {
      this.sessionConfig.store = Firebase.getInstance().getFirestoreStore()
    }
    this.express.use(Session(this.sessionConfig))
  }

  private initializeMiddlewares() {
    console.log('Middlewares init')
    this.express.use(Express.json()) // to support JSON-encoded bodies
    this.express.use(Express.urlencoded({ extended: true })) // to support URL-encoded bodies
    this.express.use(
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
    this.initSession()
  }

  private initializeControllers(controllers: ControllerInterface[]) {
    console.log('Controllers init')
    // this.controllers = controllers
    controllers.forEach(controller => {
      this.express.use('/', controller.router)
    })
  }

  /* private runControllersOnAppStart() {
    this.controllers.forEach(controller => {
      if (typeof controller.onAppStart == 'function') {
        controller.onAppStart()
      }
    })
  } */

  public run() {
    this.express.listen(process.env.PORT, () => {
      console.log(`Express listening on the port ${process.env.PORT}...`)
      // this.runControllersOnAppStart() // does not run on zeit.co (now.sh)
    })
  }
}

export default App
