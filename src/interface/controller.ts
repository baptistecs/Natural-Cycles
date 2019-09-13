import * as express from 'express'

interface ControllerInterface {
  path: string
  router: express.Router
}

export default ControllerInterface
