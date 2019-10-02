import FirebaseAdmin from 'firebase-admin'

class Firebase {
  private static instance: Firebase
  private ref: FirebaseAdmin.database.Reference

  private constructor(
    parentPath?: string | FirebaseAdmin.database.Reference | undefined,
  ) {
    if (!process.env.SERVICE_ACCOUNT) {
      throw new Error('ENV SERVICE_ACCOUNT is required (Firebase config)')
    }

    FirebaseAdmin.initializeApp({
      credential: FirebaseAdmin.credential.cert(
        JSON.parse(process.env.SERVICE_ACCOUNT as string),
      ),
      databaseURL: 'https://natural-cycles-1.firebaseio.com/',
    })
    this.ref = FirebaseAdmin.database().ref(parentPath)
  }

  static getInstance(
    parentPath: string | FirebaseAdmin.database.Reference | undefined = process
      .env.NODE_ENV,
  ): Firebase {
    if (!Firebase.instance) {
      Firebase.instance = new Firebase(parentPath)
    }
    return Firebase.instance
  }

  // e.g. childPath = "user"
  getAll(childPath: string): Promise<FirebaseAdmin.database.DataSnapshot> {
    return this.ref.child(childPath).once('value')
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

  getFirstObjectByChildProperty(
    childPath: string, // e.g. "user"
    property: string, // e.g. "email"
    value: string | number | boolean | null, // e.g. "test@test.Com"
  ): Promise<FirebaseAdmin.database.DataSnapshot> {
    return this.ref
      .child(childPath)
      .orderByChild(property)
      .equalTo(value)
      .limitToFirst(1)
      .once('value')
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
}

export default Firebase
export type EventType = FirebaseAdmin.database.EventType
