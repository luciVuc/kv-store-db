"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const path_1 = require("path");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, main_1.createDatabase)({
        name: "testDb",
        path: (0, path_1.join)(__dirname, '../data'),
        onChange: (data) => console.log(JSON.stringify(data))
    });
    const db0 = yield (0, main_1.createDatabase)({
        name: "testDb",
        path: (0, path_1.join)(__dirname, '../data'),
        onChange: (data) => console.log(JSON.stringify(data))
    });
    // db and db0 reference the same instance
    console.log('* DB singleton:', db === db0);
    // set a new collection with one entry
    console.log('==============================================================');
    console.log('* Adding a new collection with one entry');
    console.log('--------------------------------------------------------------');
    yield db.set('users', {
        id: '1',
        name: 'John',
        age: 32
    });
    console.log('users -->', yield db.get('users')); // users --> { '1': { id: '1', name: 'John', age: 32 } }
    console.log('users/1 -->', yield db.get('users/1')); // users/1 --> { id: '1', name: 'John', age: 32 }
    console.log('users/1/name -->', yield db.get('users/1/name')); // users/1/name --> John
    // set a new entry in an existing collection
    console.log('==============================================================');
    console.log('* Adding a new entry in an existing collection');
    console.log('--------------------------------------------------------------');
    yield db.set('users', {
        id: '2',
        name: 'Jane',
        age: 31
    });
    console.log('users -->', yield db.get('users')); // users --> { '1': { id: '1', name: 'John', age: 32 }, '2': { id: '2', name: 'Jane', age: 31 } }
    console.log('users/2 -->', yield db.get('users/2')); // users/2 --> { id: '2', name: 'Jane', age: 31 }
    console.log('users/2/name -->', yield db.get('users/2/name')); // users/2/name --> Jane  
    // update an entry in a collection
    console.log('==============================================================');
    console.log('* Updating an entry in a collection, (without merge)');
    console.log('--------------------------------------------------------------');
    yield db.set('users/1', {
        age: 35
    });
    console.log('users -->', yield db.get('users')); // users --> { '1': { age: 35 }, '2': { id: '2', name: 'Jane', age: 31 } }
    console.log('users/1 -->', yield db.get('users/1')); // users/1 --> { age: 35 }
    console.log('users/1/name -->', yield db.get('users/1/name')); // users/1/name --> undefined
    // update an entry in a collection with merge
    console.log('==============================================================');
    console.log('* Updating an entry in a collection (with merge)');
    console.log('--------------------------------------------------------------');
    yield db.set('users/1', {
        id: '1',
        name: 'John',
    }, true);
    console.log('users -->', yield db.get('users')); // users --> { '1': { age: 35, id: '1', name: 'John' }, '2': { id: '2', name: 'Jane', age: 31 } }
    console.log('users/1 -->', yield db.get('users/1')); // users/1 --> { age: 35, id: '1', name: 'John' }
    console.log('users/1/name -->', yield db.get('users/1/name')); // users/1/name --> John
    // update a field of an entry in a collection
    console.log('==============================================================');
    console.log('* Updating a field of an entry in a collection');
    console.log('--------------------------------------------------------------');
    yield db.set('users/2/age', 33);
    console.log('users -->', yield db.get('users')); // users --> { '1': { age: 35, id: '1', name: 'John' }, '2': { id: '2', name: 'Jane', age: 33 } }
    console.log('users/2/age -->', yield db.get('users/2/age')); // users/2/age --> 33
    // add a new field to an entry in a collection
    console.log('==============================================================');
    console.log('* Adding a new field to an entry in a collection');
    console.log('--------------------------------------------------------------');
    yield db.set('users/2/peers', ['1']);
    console.log('users -->', yield db.get('users')); // users --> { '1': { age: 35, id: '1', name: 'John' }, '2': { id: '2', name: 'Jane', age: 33, peers: [ '1' ] } }
    console.log('users/2/peers -->', yield db.get('users/2/peers')); // users/2/peers --> [ '1' ]
    // delete a field of an entry in a collection
    console.log('==============================================================');
    console.log('* Deleting a field of an entry in a collection');
    console.log('--------------------------------------------------------------');
    yield db.delete('users/2/peers');
    console.log('users -->', yield db.get('users')); // users --> { '1': { age: 35, id: '1', name: 'John' }, '2': { id: '2', name: 'Jane', age: 33 } }
    console.log('users/2/peers -->', yield db.get('users/2/peers')); // users/2/peers --> undefined
    console.log('==============================================================');
}))();
