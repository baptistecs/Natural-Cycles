import FirebaseAdmin from 'firebase-admin'

class Firebase {
  private static instance: Firebase
  private ref: FirebaseAdmin.database.Reference

  private constructor(
    parentPath?: string | FirebaseAdmin.database.Reference | undefined,
  ) {
    let serviceAccount = require('../../config/development/firebase.json')
    FirebaseAdmin.initializeApp({
      credential: FirebaseAdmin.credential.cert(serviceAccount),
      databaseURL: 'https://natural-cycles-1.firebaseio.com/',
    })
    this.ref = FirebaseAdmin.database().ref(parentPath)
  }

  static getInstance(
    parentPath?: string | FirebaseAdmin.database.Reference | undefined,
  ): Firebase {
    if (!Firebase.instance) {
      Firebase.instance = new Firebase(parentPath)
    }
    return Firebase.instance
  }

  addReferenceListener(
    childPath: string, // e.g. "user"
    callback: (id: string, value: any) => void,
    event: FirebaseAdmin.database.EventType = 'child_added',
  ) {
    this.ref.child(childPath).on(event, snapshot => {
      if (snapshot) {
        callback(snapshot.key as string, snapshot.val())
      }
    })
  }

  setObject(
    childPath: string, // e.g. "user"
    key: string, // must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"
    data: Object,
  ): Promise<void> {
    // let value: { [k: string]: any } = {}
    // value[key] = data
    return this.ref.child(childPath + '/' + key).set(data)
  }

  removeObject(
    childPath: string, // e.g. "user"
    key: string, // must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"
  ): Promise<void> {
    return this.ref.child(childPath + '/' + key).remove()
  }

  pushObject(
    childPath: string, // e.g. "user"
    data: Object,
  ) {
    this.ref
      .child(childPath)
      .push(data)
      .then(result => {
        console.log(childPath + ' added on this node: ' + result.key)
      })
      .catch(reason => {
        throw new Error(reason)
      })
  }

  // .ref('/user')
  // .set({ email: 'GET Request' })
}

export default Firebase
export type EventType = FirebaseAdmin.database.EventType
