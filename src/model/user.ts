import Validator from '../tool/validator'

class User {
  private id?: string
  private email?: string

  constructor(id?: string, email?: string) {
    if (id) {
      this.setId(id)
    }
    if (email) {
      this.setEmail(email)
    }
  }

  // SETTERS & GETTERS

  getId() {
    return this.id
  }

  setId(id: string) {
    this.id = id
    return this
  }

  getEmail() {
    return this.email
  }

  setEmail(email: string) {
    if (!Validator.isEmail(email)) {
      throw new Error('Invalid email address')
    }
    this.email = email
    return this
  }
}

export default User
