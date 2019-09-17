import App from './app'
import HelloWorldController from './controller/hello-world-controller'

const app = new App([new HelloWorldController()])

app.listen()
