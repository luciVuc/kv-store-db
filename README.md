# kv-store-db

> A fast, lightweight, and easy-to-use in-memory and in-process key-value datastore for node.js

## Installation

To install it, use

`npm install kv-store-db`

## Usage

To use `kv-store-db`:

### Import `kv-store-db` library

```js
const { createDatabase } = require('kv-store-db'); // ES/JS
// or
import { createDatabase } from 'kv-store-db'; // Typescript
```

### Create an instance

```js
const db = createDatabase({
  name: "...", // db file name
  path: "...", // db file path
  onChange: (data) => {....} // data change handler
});
```

### Example

```js
import { createDatabase } from './main';
import { join } from 'path';

interface IUser {
  id: string | number;
  name: string;
  age: number;
  peers?: string[];
}

(async () => {
  const db = await createDatabase({
    name: "testDb",
    path: join(__dirname, '../data'),
    onChange: (data) => console.log(JSON.stringify(data))
  });

  // set a new collection with one entry
  console.log('==============================================================');
  console.log('* Adding a new collection with one entry');
  console.log('--------------------------------------------------------------');
  await db.set('users', {
    id: '1',
    name: 'John',
    age: 32
  } as IUser);
  console.log('users -->', await db.get('users'));                // users --> { '1': { id: '1', name: 'John', age: 32 } }
  console.log('users/1 -->', await db.get('users/1'));            // users/1 --> { id: '1', name: 'John', age: 32 }
  console.log('users/1/name -->', await db.get('users/1/name'));  // users/1/name --> John

  // set a new entry in an existing collection
  console.log('==============================================================');
  console.log('* Adding a new entry in an existing collection');
  console.log('--------------------------------------------------------------');
  await db.set('users', {
    id: '2',
    name: 'Jane',
    age: 31
  } as IUser);
  console.log('users -->', await db.get('users'));                // users --> { '1': { id: '1', name: 'John', age: 32 }, '2': { id: '2', name: 'Jane', age: 31 } }
  console.log('users/2 -->', await db.get('users/2'));            // users/2 --> { id: '2', name: 'Jane', age: 31 }
  console.log('users/2/name -->', await db.get('users/2/name'));  // users/2/name --> Jane  

  // update an entry in a collection
  console.log('==============================================================');
  console.log('* Updating an entry in a collection, (without merge)');
  console.log('--------------------------------------------------------------');
  await db.set('users/1', {
    age: 35
  } as IUser);
  console.log('users -->', await db.get('users'));                // users --> { '1': { age: 35 }, '2': { id: '2', name: 'Jane', age: 31 } }
  console.log('users/1 -->', await db.get('users/1'));            // users/1 --> { age: 35 }
  console.log('users/1/name -->', await db.get('users/1/name'));  // users/1/name --> undefined

  // update an entry in a collection with merge
  console.log('==============================================================');
  console.log('* Updating an entry in a collection (with merge)');
  console.log('--------------------------------------------------------------');
  await db.set('users/1', {
    id: '1',
    name: 'John',
  } as IUser, true);
  console.log('users -->', await db.get('users'));                // users --> { '1': { age: 35, id: '1', name: 'John' }, '2': { id: '2', name: 'Jane', age: 31 } }
  console.log('users/1 -->', await db.get('users/1'));            // users/1 --> { age: 35, id: '1', name: 'John' }
  console.log('users/1/name -->', await db.get('users/1/name'));  // users/1/name --> John

  // update a field of an entry in a collection
  console.log('==============================================================');
  console.log('* Updating a field of an entry in a collection');
  console.log('--------------------------------------------------------------');
  await db.set('users/2/age', 33);
  console.log('users -->', await db.get('users'));              // users --> { '1': { age: 35, id: '1', name: 'John' }, '2': { id: '2', name: 'Jane', age: 33 } }
  console.log('users/2/age -->', await db.get('users/2/age'));  // users/2/age --> 33

  // add a new field to an entry in a collection
  console.log('==============================================================');
  console.log('* Adding a new field to an entry in a collection');
  console.log('--------------------------------------------------------------');
  await db.set('users/2/peers', ['1']);
  console.log('users -->', await db.get('users'));                  // users --> { '1': { age: 35, id: '1', name: 'John' }, '2': { id: '2', name: 'Jane', age: 33, peers: [ '1' ] } }
  console.log('users/2/peers -->', await db.get('users/2/peers'));  // users/2/peers --> [ '1' ]

  // delete a field of an entry in a collection
  console.log('==============================================================');
  console.log('* Deleting a field of an entry in a collection');
  console.log('--------------------------------------------------------------');
  await db.delete('users/2/peers');
  console.log('users -->', await db.get('users'));                  // users --> { '1': { age: 35, id: '1', name: 'John' }, '2': { id: '2', name: 'Jane', age: 33 } }
  console.log('users/2/peers -->', await db.get('users/2/peers'));  // users/2/peers --> undefined

  console.log('==============================================================');
})();

```

### API

---

* `set(key: string, value: any, merge?: boolean): Promise<any>`

Sets a (new or existing) value by key in the DB store.

```js
db.set(key: string, value: any, merge?: boolean): Promise<any>;
```

The key is a string in a format like `collectionName/:recId/:fieldName`,
where the `collectionName` is the identifier of a collection in the store,
while the `recId` identifies a specific record (entry) in the
data collection, and the `fieldName` identifies a specific field of the
specific record (entry) in the data collection.

Both `recId` and `fieldName` are optional, and if not provided,
the key is assumed to indicate the name of the collection. In this case,
the value is expected to be an object that contains the new data entries
for the collection (a `TDataCollectionEntry` compatible object).

However, if the key contains both `collectionName` and `recId` components,
it is assumed to refer to a particular record (entry) in the collection.
In this case the value must be a data collection entry (a object compatible
with a `Map` of `TDataRecord` items).

If the key contains all three components, it is assumed to refer to a
specific data field of the given record (entry) in the data collection.

The `merge` flag is optional as well, and it serves when setting
entries (records) in a collection, (e.g. using the `collectionName/:recId` key variant), to indicate whether to merge the new fields with the existing fields of the identified record in the collection, or to replace all its existing fields with the new ones. By default `merge` is `false`, which means that the new data fields passed as `value`  replace the existing ones.

---

* `get(key: string): Promise<any>`

Gets (retrieves) the data of the collection, record or the field identified
by the given key in the store.

```js
db.get(key: string): Promise<any>;
```

The key is a string in this `collectionName/:recId/:fieldName` format,
where the `collectionName` is required and is the collection identifier.

The `recId`, which is optional, is the identifier of the record (entry)
in the collection, and the `fieldName`, optional as well, is the identifier
of a particular field of the given record (entry) in the collection.

If the given key only contains the `collectionName` it returns all the data
from the collection identified. If the given key only contains the `collectionName` and the `recId` it returns the data of the identified record (entry) in the collection.

If the given key only all three components, the `collectionName`, the `recId` and `fieldName`it returns the value of the named field in the identified record (entry) in the collection.

If the key does not identify any collection, record or field in the store,
it returns `undefined`.

---

* `has(key: string): Promise<boolean>`

Returns `true` if the DB store has a collection, a collection with a record or a collection with a record with a field that is identified by the given key.

```js
db.has(key: string): Promise<boolean>;
```

The key is a string in this `collectionName/:recId/:fieldName` format,
where the `collectionName` is required and is the collection identifier.

The `recId`, which is optional, is the identifier of the record (entry)
in the collection, and the `fieldName`, optional as well, is the identifier
of a particular field of the given record (entry) in the collection.

If the key does not identify any collection, record or field in the store,
it returns `false`.

---

* `delete(key: string): Promise<boolean>`

Deletes from the DB store the collection, the record or the data field specified by the key, and returns `true` to indicate that the operation is successful.

```js
db.delete(key: string): Promise<boolean>;
```

The key is a string in this `collectionName/:recId/:fieldName` format,
where the `collectionName` is required and is the collection identifier.

The `recId`, which is optional, is the identifier of the record (entry)
in the collection, and the `fieldName`, optional as well, is the identifier
of a particular field of the given record (entry) in the collection.

If the key does not identify any collection, record or field in the store,
it returns `false`, indicating that nothing was deleted.

---

* `clear(key: string): Promise<any>`

Clears the collection or collection record identified by key in the store.

```js
db.clear(key: string): Promise<any>;
```

The key is a string in a format like `collectionName/:recId`,
where the `collectionName` is the identifier of a collection in the store,
while the `recId` identifies a specific record (entry) in the
data collection.

---

* `entries(key: string): Promise<[string, any][]>`

Returns an iterator with all entries of the collection or record identified
by the key in the store.

```js
db.entries(key: string): Promise<[string, any][]>;
```

The key is a string in a format like `collectionName/:recId`,
where the `collectionName` is the identifier of a collection in the store,
while the `recId` identifies a specific record (entry) in the
data collection.

---

* `collection(name: string): Promise<TDataCollectionEntry | undefined>`

Returns the data collection object with the given name, or `undefined`
if the collection does not exist in the store.

```js
db.collection(name: string): Promise<TDataCollectionEntry | undefined>;
```

---

* `collections`

A read-only property that returns an array containing the names
of all data collections in the store.

```js
db.collections; // string[]
```

---

* `dataFile`

A read-only property that returns the name and path of the data file.

```js
dataFile; // string
```

## Version

1.2.0
