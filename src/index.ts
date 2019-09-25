import App from './app'
import HomeController from './controller/home-controller'
import UserController from './controller/user-controller'

const userController = new UserController()
const app = App.getInstance([
  new HomeController(userController),
  userController,
])

app.run()
