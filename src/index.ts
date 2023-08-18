export * from './main';
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

  const db0 = await createDatabase({
    name: "testDb",
    path: join(__dirname, '../data'),
    onChange: (data) => console.log(JSON.stringify(data))
  });

  // db and db0 reference the same instance
  console.log('* DB singleton:', db === db0);

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
