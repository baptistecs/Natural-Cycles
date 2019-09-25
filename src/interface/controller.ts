import * as express from 'express'

interface ControllerInterface {
  readonly path: string
  router: express.Router

  onAppStart?: Function
}

export default ControllerInterface
