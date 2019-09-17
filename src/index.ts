import App from './app'
import HomeController from './controller/home-controller'

const app = new App([new HomeController()])

app.listen()
