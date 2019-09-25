import Validator from '../tool/validator'

class User {
  private id!: string // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions
  private email!: string

  constructor(email: string, id?: string) {
    this.setEmail(email)
    if (id) {
      this.setId(id)
    } else {
      this.generateIdFromEmail()
    }
  }

  // !! TODO !!
  private generateIdFromEmail() {
    // this.getEmail()
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
      throw new Error('Invalid email address' + JSON.stringify(email))
    }
    this.email = email
    return this
  }
}

export default User
