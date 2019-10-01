import Blake2bConfig from '../interface/blake2b-config'
let Blake2b = require('blake2b')

/**
 * @fileOverview Blake2b wrapper.
 * @author Baptiste Clarey Sjöstrand
 * @version 1.0.0
 */
export default class Blake2bWrapper {
  private static instance: Blake2bWrapper
  private key: Buffer
  private salt: Buffer

  private constructor() {
    if (!process.env.BLAKE2B) {
      throw new Error('ENV BLAKE2B is required')
    }

    const CONFIG: Blake2bConfig = JSON.parse(process.env.BLAKE2B)

    if (!CONFIG.key) {
      throw new Error('ENV BLAKE2B.key is required')
    }

    if (!CONFIG.salt) {
      throw new Error('ENV BLAKE2B.salt is required')
    }

    this.key = Buffer.from(CONFIG.key)
    if (this.key.length > Blake2b.KEYBYTES_MAX) {
      throw new Error(
        'Key must be between ' +
          Blake2b.KEYBYTES_MIN +
          ' & ' +
          Blake2b.KEYBYTES_MAX +
          ' bytes long',
      )
    }
    this.salt = Buffer.from(CONFIG.salt)
    if (this.key.length > Blake2b.KEYBYTES_MAX) {
      throw new Error(
        'Salt must be exactly ' + Blake2b.SALTBYTES + ' bytes long',
      )
    }
  }

  getDigest = async (
    input: string,
    outFormat:
      | 'binary'
      | 'hex'
      | Uint8Array
      | Buffer
      | number
      | undefined = 'hex',
    outLength: number = Blake2b.BYTES,
  ): Promise<string> => {
    if (Math.round(outLength) !== outLength) {
      console.warn(
        'Blake2b.getHexDigest out parameter number must be an interger',
      )
      outLength = Math.round(outLength)
    }

    if (outLength < Blake2b.BYTES_MIN || outLength > Blake2b.BYTES_MAX) {
      outLength = Blake2b.BYTES
      console.warn(
        `Blake2b.getHexDigest out parameter must be between ${Blake2b.BYTES_MIN} & ${Blake2b.BYTES_MAX}`,
      )
    }

    return new Promise((resolve: Function, reject: Function) => {
      try {
        let inputBuffer = Buffer.from(input)
        let hash = Blake2b(outLength, this.key, this.salt) //, [personal], [noAssert = false])
        hash = hash.update(inputBuffer)
        let digest = hash.digest(outFormat)
        resolve(digest)
      } catch (error) {
        console.log(error)
        reject(error.toString())
      }
    })
  }

  static getInstance(): Blake2bWrapper {
    if (!Blake2bWrapper.instance) {
      Blake2bWrapper.instance = new Blake2bWrapper()
    }
    return Blake2bWrapper.instance
  }
}

/* https://www.npmjs.com/package/blake2b
console.log('BYTES_MIN: ', Blake2b.BYTES_MIN) // Minimum length of out // 16
console.log('BYTES_MAX: ', Blake2b.BYTES_MAX) // Maximum length of out // 64
console.log('BYTES: ', Blake2b.BYTES) // Recommended default length of out // 32
console.log('KEYBYTES_MIN: ', Blake2b.KEYBYTES_MIN) // Minimum length of key // 16
console.log('KEYBYTES_MAX: ', Blake2b.KEYBYTES_MAX) // Maximum length of key // 64
console.log('KEYBYTES: ', Blake2b.KEYBYTES) // Recommended default length of key // 32
console.log('SALTBYTES: ', Blake2b.SALTBYTES) // Required length of salt // 16
console.log('PERSONALBYTES: ', Blake2b.PERSONALBYTES) // Required length of personal // 16 */
