import Validator from '../tool/validator'

/**
 * @fileOverview User model.
 * @author Baptiste Clarey Sjöstrand
 * @version 1.0.0
 */
class User {
  /** The id of the user
   * @type {string} */
  private id!: string // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions
  /** The email of the user
   * @type {string} */
  private email!: string

  /**
   * @constructor
   * @property {string} email The email of the user, it will be saved in lower case format
   * @property {string} [id=email] The id of the user, it will be formated in order to comply with Firebase key limitations
   * @returns {User} The current user instance
   */
  constructor(email: string, id?: string) {
    this.setEmail(email)
    if (id) {
      this.setId(id)
    } else {
      this.setId(this.getEmail())
    }
  }

  // SETTERS & GETTERS

  /**
   * Id getter
   * @returns {string}
   */
  getId() {
    return this.id
  }

  /**
   * Id setter
   * Id will be formated in order to comply with Firebase key limitations
   * @param {string} id
   * @returns {User} The current user instance
   */
  setId(id: string) {
    this.id = User.idFormat(id)
    return this
  }

  /**
   * Email getter
   * @returns {string}
   */
  getEmail(): string {
    return this.email
  }

  /**
   * Email setter
   * Email will be set in lower case
   * @param {string} email
   * @returns {User} The current user instance
   */
  setEmail(email: string) {
    if (!User.checkEmail(email)) {
      User.throwEmailError(email)
    }
    this.email = User.emailFormat(email)
    return this
  }

  // FORMATERS

  /**
   * Format email to lower case in order to assure unicity
   * @param {string} email
   * @returns {string}
   */
  static emailFormat(email: string): string {
    return email.toLowerCase()
  }

  /**
   * Format id by replacing special characters in order to comply with Firebase key limitations
   * @param {string} id
   * @returns {string}
   */
  static idFormat(id: string): string {
    return id
      .replace(/\./g, '_dot_')
      .replace(/#/g, '_diese_')
      .replace(/\$/g, '_dollar_')
      .replace(/\//g, '_slash_')
      .replace(/\[/g, '_obracket_')
      .replace(/\]/g, '_cbracket_')
  }

  // VALIDATORS

  /**
   * Email validity verification wrapper
   * - We must only use User.checkEmail in all the App
   * and update code here if required
   * - Email will be formated before the validation check
   * @param {string} email
   * @returns {boolean}
   */
  static checkEmail(email: string): boolean {
    return Validator.isEmail(User.emailFormat(email))
  }

  // EXEPTIONS

  /**
   * Throw an error for invalid email
   * @param {string} email
   * @throws {Error}
   */
  static throwEmailError(email: string): boolean {
    throw new Error('Invalid email address ' + JSON.stringify(email))
  }
}

export default User
