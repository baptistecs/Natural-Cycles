import User from '../model/user'

export default interface UserCollection {
  [key: string]: User
}
