import App from './app'
import HelloWorldController from './controller/hello-world-controller'

const port = 8080
const app = new App([new HelloWorldController()], port)

app.listen()
