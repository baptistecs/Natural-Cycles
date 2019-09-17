import * as express from 'express'

interface ControllerInterface {
  readonly path: string
  router: express.Router
}

export default ControllerInterface
