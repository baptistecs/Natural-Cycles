import App from './app'
import HomeController from './controller/home-controller'
import UserController from './controller/user-controller'

const userController = new UserController()
const app = new App([new HomeController(userController), userController])

app.run()
