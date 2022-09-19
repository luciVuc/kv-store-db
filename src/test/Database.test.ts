import { copyFile } from 'node:fs';
import { rm } from 'node:fs/promises';
import { createDatabase, DataTypeMap } from '../main';
import sampleData from './data/sample.json';
import { join } from 'path';

describe('Database', () => {
  beforeAll(() => {
    copyFile(join(__dirname, 'data/sample.json'), join(__dirname, 'data/test.json'), (err) => {
      if (err) {
        throw err;
      }
    });
  });

  it('initializes with no data file', async () => {
    const db = await createDatabase({
      name: 'none',
      path: join(__dirname, 'data')
    });
    expect(db).not.toBeUndefined();
    expect(db.tables.length).toBe(0);
    await rm(join(__dirname, 'data/none.json'));
  });

  it('instance is singleton', async () => {
    const db = await createDatabase({
      name: 'none',
      path: join(__dirname, 'data')
    });
    const db1 = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });
    const db2 = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(db === db1).toBe(false);
    expect(db === db2).toBe(false);
    expect(db1 === db2).toBe(true);
  });

  it('initializes with data file', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });
    expect(db).not.toBeUndefined();
    expect(db.tables).toMatchObject(['users', 'posts']);
  });

  it('gets the tables', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });
    expect(db.tables).toEqual(['users', 'posts']);

    expect(await db.table('users')).toMatchObject({
      'user1': new DataTypeMap({
        "id": "user1",
        "fName": "John",
        "lName": "Doe",
        "age": 30
      }, 'user1')
    });

    expect(await db.table('users')).toMatchObject({
      'user2': new DataTypeMap({
        "id": "user2",
        "fName": "Gigi",
        "lName": "Duru",
        "age": 33,
        "peers": [
          "user1"
        ]
      }, 'user2')
    });

    expect(await db.table('posts')).toMatchObject({
      "post1": new DataTypeMap({
        "id": "post1",
        "userId": "user1",
        "content": "Hello"
      }, 'post1')
    });

    expect(await db.table('posts')).toMatchObject({
      "post2": new DataTypeMap({
        "id": "post2",
        "userId": "user2",
        "content": "Howdy!",
        "reply": "post1"
      }, 'post2')
    });
  });

  it('gets values by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users/user1/id')).toEqual('user1');
    expect(await db.get('users/user1/fName')).toEqual('John');
    expect(await db.get('users/user1/lName')).toEqual('Doe');
    expect(await db.get('users/user1/age')).toEqual(30);
    expect(await db.get('users/user1/fullName')).toBeUndefined();

    expect(await db.get('users/user2/id')).toEqual('user2');
    expect(await db.get('users/user2/fName')).toEqual('Gigi');
    expect(await db.get('users/user2/lName')).toEqual('Duru');
    expect(await db.get('users/user2/age')).toEqual(33);
  });

  it('gets records by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users/user1')).toMatchObject({
      "id": "user1",
      "fName": "John",
      "lName": "Doe",
      "age": 30
    });
    expect(await db.get('users/user2')).toMatchObject({
      "id": "user2",
      "fName": "Gigi",
      "lName": "Duru",
      "age": 33,
      "peers": [
        "user1"
      ]
    });
    expect(await db.get('posts/post1')).toMatchObject({
      "id": "post1",
      "userId": "user1",
      "content": "Hello"
    });
    expect(await db.get('posts/post2')).toMatchObject({
      "id": "post2",
      "userId": "user2",
      "content": "Howdy!",
      "reply": "post1"
    });
    expect(await db.get('posts/post3')).toBeUndefined();
  });

  it('gets tables by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users')).toMatchObject({
      'user1': {
        "id": "user1",
        "fName": "John",
        "lName": "Doe",
        "age": 30
      },
      'user2': {
        "id": "user2",
        "fName": "Gigi",
        "lName": "Duru",
        "age": 33,
        "peers": [
          "user1"
        ]
      }
    });
    expect(await db.get('posts')).toMatchObject({
      'post1': {
        "id": "post1",
        "userId": "user1",
        "content": "Hello"
      },
      'post2': {
        "id": "post2",
        "userId": "user2",
        "content": "Howdy!",
        "reply": "post1"
      }
    });
    expect(await db.get('likes')).toMatchObject({});
  });

  it('gets all data by empty key', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('')).toMatchObject({
      ...sampleData
    });
    expect(await db.get('*')).toMatchObject({
      ...sampleData
    });
  });

  it('sets values by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users/user1/id')).toEqual('user1');
    expect(await db.get('users/user1/fName')).toEqual('John');
    expect(await db.get('users/user1/lName')).toEqual('Doe');
    expect(await db.get('users/user1/age')).toEqual(30);

    await db.set('users/user1/id', 'USER1');
    await db.set('users/user1/age', 31);
    await db.set('users/USER1/age', 32);

    expect(await db.get('users/user1/id')).toEqual('USER1');
    expect(await db.get('users/user1/fName')).toEqual('John');
    expect(await db.get('users/user1/lName')).toEqual('Doe');
    expect(await db.get('users/user1/age')).toEqual(31);

    expect(await db.get('users/USER1/id')).toBeUndefined();
    expect(await db.get('users/USER1/fName')).toBeUndefined();
    expect(await db.get('users/USER1/lName')).toBeUndefined();
    expect(await db.get('users/USER1/age')).toEqual(32);

    await db.clear('');
    await db.set('', sampleData);
  });

  it('sets records by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users/user1')).toMatchObject({
      "id": "user1",
      "fName": "John",
      "lName": "Doe",
      "age": 30
    });
    expect(await db.get('users/user2')).toMatchObject({
      "id": "user2",
      "fName": "Gigi",
      "lName": "Duru",
      "age": 33,
      "peers": [
        "user1"
      ]
    });
    expect(await db.get('posts/post1')).toMatchObject({
      "id": "post1",
      "userId": "user1",
      "content": "Hello"
    });
    expect(await db.get('posts/post2')).toMatchObject({
      "id": "post2",
      "userId": "user2",
      "content": "Howdy!",
      "reply": "post1"
    });

    expect(await db.get('posts/post3')).toBeUndefined();
    expect(await db.get('users/USER1')).toBeUndefined();

    await db.set('posts/post3', {
      "id": "post3",
      "userId": "user2",
      "content": "Hey yall!",
      "reply": "post1"
    });

    await db.set('users/USER1', {
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35,
      "peers": [
      ]
    });

    expect(await db.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35,
      "peers": [
      ]
    });

    expect(await db.get('posts/post3')).toMatchObject({
      "id": "post3",
      "userId": "user2",
      "content": "Hey yall!",
      "reply": "post1"
    });

    await db.clear('');
    await db.set('', sampleData);
  });

  it('sets records by keys - no merge', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users/USER1')).toBeUndefined();

    await db.set('users/USER1', {
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35
    });

    expect(await db.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35
    });

    await db.set('users/USER1', {
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "peers": [
      ]
    });

    expect(await db.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "peers": [
      ]
    });

    await db.clear('');
    await db.set('', sampleData);
  });

  it('sets records by keys - with merge', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users/USER1')).toBeUndefined();

    await db.set('users/USER1', {
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35
    }, true);

    expect(await db.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35
    });

    await db.set('users/USER1', {
      "id": "USER1",
      "fName": "Run Forest",
      "lName": "Gump",
      "peers": [
      ]
    }, true);

    expect(await db.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Run Forest",
      "lName": "Gump",
      "age": 35,
      "peers": [
      ]
    });

    await db.clear('');
    await db.set('', sampleData);
  });

  it('sets tables by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users')).toMatchObject({
      'user1': {
        "id": "user1",
        "fName": "John",
        "lName": "Doe",
        "age": 30
      },
      'user2': {
        "id": "user2",
        "fName": "Gigi",
        "lName": "Duru",
        "age": 33,
        "peers": [
          "user1"
        ]
      }
    });
    expect(await db.get('posts')).toMatchObject({
      'post1': {
        "id": "post1",
        "userId": "user1",
        "content": "Hello"
      },
      'post2': {
        "id": "post2",
        "userId": "user2",
        "content": "Howdy!",
        "reply": "post1"
      }
    });
    expect(await db.get('likes')).toMatchObject({});
    expect(await db.tables).toMatchObject(['users', 'posts']);

    await db.set('likes/like1', {
      'id': 'like1',
      'post': 'post1'
    });

    expect(await db.get('users')).toMatchObject({
      'user1': {
        "id": "user1",
        "fName": "John",
        "lName": "Doe",
        "age": 30
      },
      'user2': {
        "id": "user2",
        "fName": "Gigi",
        "lName": "Duru",
        "age": 33,
        "peers": [
          "user1"
        ]
      }
    });
    expect(await db.get('posts')).toMatchObject({
      'post1': {
        "id": "post1",
        "userId": "user1",
        "content": "Hello"
      },
      'post2': {
        "id": "post2",
        "userId": "user2",
        "content": "Howdy!",
        "reply": "post1"
      }
    });
    expect(await db.get('likes')).toMatchObject({
      'like1': {
        'id': 'like1',
        'post': 'post1'
      }
    });
    expect(await db.tables).toMatchObject(['users', 'posts', 'likes']);

    await db.clear('');
    await db.set('', sampleData);
  });

  it('has values by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.has('users/user1/id')).toBe(true);
    expect(await db.has('users/user1/fName')).toBe(true);
    expect(await db.has('users/user1/lName')).toBe(true);
    expect(await db.has('users/user1/age')).toBe(true);
    expect(await db.has('users/user1/fullName')).toBe(false);
  });

  it('has records by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.has('users/user1')).toBe(true);
    expect(await db.has('users/user2')).toBe(true);
    expect(await db.has('users/user3')).toBe(false);
    expect(await db.has('posts/post1')).toBe(true);
    expect(await db.has('posts/post3')).toBe(false);
  });

  it('has tables by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.has('users')).toBe(true);
    expect(await db.has('posts')).toBe(true);
    expect(await db.has('likes')).toBe(false);
  });

  it('deletes values by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users/user1/id')).toEqual('user1');
    expect(await db.get('users/user1/fName')).toEqual('John');
    expect(await db.get('users/user1/lName')).toEqual('Doe');
    expect(await db.get('users/user1/age')).toEqual(30);
    expect(await db.get('users/user1/fullName')).toBeUndefined();

    expect(await db.has('users/user1/id')).toBe(true);
    expect(await db.has('users/user1/fName')).toBe(true);
    expect(await db.has('users/user1/lName')).toBe(true);
    expect(await db.has('users/user1/age')).toBe(true);
    expect(await db.has('users/user1/fullName')).toBe(false);

    await db.delete('users/user1/age');

    expect(await db.get('users/user1/id')).toEqual('user1');
    expect(await db.get('users/user1/fName')).toEqual('John');
    expect(await db.get('users/user1/lName')).toEqual('Doe');
    expect(await db.get('users/user1/age')).toBeUndefined();
    expect(await db.get('users/user1/fullName')).toBeUndefined();

    expect(await db.has('users/user1/id')).toBe(true);
    expect(await db.has('users/user1/fName')).toBe(true);
    expect(await db.has('users/user1/lName')).toBe(true);
    expect(await db.has('users/user1/age')).toBe(false);
    expect(await db.has('users/user1/fullName')).toBe(false);

    await db.clear('');
    await db.set('', sampleData);
  });

  it('deletes records by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.has('users/user1')).toBe(true);
    expect(await db.has('users/user2')).toBe(true);
    expect(await db.has('users/user3')).toBe(false);
    expect(await db.has('posts/post1')).toBe(true);
    expect(await db.has('posts/post3')).toBe(false);

    await db.delete('users/user1');
    await db.delete('users/user3');

    expect(await db.has('users/user1')).toBe(false);
    expect(await db.has('users/user2')).toBe(true);
    expect(await db.has('users/user3')).toBe(false);
    expect(await db.has('posts/post1')).toBe(true);
    expect(await db.has('posts/post3')).toBe(false);

    await db.clear('');
    await db.set('', sampleData);
  });

  it('deletes tables by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.has('users')).toBe(true);
    expect(await db.has('posts')).toBe(true);
    expect(await db.has('likes')).toBe(false);

    await db.delete('users');
    await db.delete('likes');

    expect(await db.has('users')).toBe(false);
    expect(await db.has('posts')).toBe(true);
    expect(await db.has('likes')).toBe(false);

    await db.clear('');
    await db.set('', sampleData);
  });

  it('clears all db data', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.has('users/user1')).toBe(true);
    expect(await db.has('users/user2')).toBe(true)
    expect(await db.has('likes/likes1')).toBe(false);

    await db.clear('');

    expect(await db.has('users/user1')).toBe(false);
    expect(await db.has('users/user2')).toBe(false);
    expect(await db.has('likes/like1')).toBe(false);

    await db.clear('');
    await db.set('', sampleData);
  });

  it('clears records by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users/user1')).toMatchObject({
      "id": "user1",
      "fName": "John",
      "lName": "Doe",
      "age": 30
    });
    expect(await db.get('users/user2')).toMatchObject({
      "id": "user2",
      "fName": "Gigi",
      "lName": "Duru",
      "age": 33,
      "peers": [
        "user1"
      ]
    });
    expect(await db.has('likes/likes1')).toBe(false);

    await db.clear('users/user1');
    await db.clear('likes/like1');

    expect(await db.get('users/user1')).toMatchObject({});
    expect(await db.get('users/user2')).toMatchObject({
      "id": "user2",
      "fName": "Gigi",
      "lName": "Duru",
      "age": 33,
      "peers": [
        "user1"
      ]
    });
    expect(await db.has('likes/like1')).toBe(false);

    await db.clear('');
    await db.set('', sampleData);
  });

  it('clears tables by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.get('users')).toMatchObject({
      'user1': {
        "id": "user1",
        "fName": "John",
        "lName": "Doe",
        "age": 30
      },
      'user2': {
        "id": "user2",
        "fName": "Gigi",
        "lName": "Duru",
        "age": 33,
        "peers": [
          "user1"
        ]
      }
    });
    expect(await db.get('posts')).toMatchObject({
      'post1': {
        "id": "post1",
        "userId": "user1",
        "content": "Hello"
      },
      'post2': {
        "id": "post2",
        "userId": "user2",
        "content": "Howdy!",
        "reply": "post1"
      }
    });
    expect(await db.get('likes')).toMatchObject({});

    await db.clear('users');
    await db.clear('likes');

    expect(await db.get('users')).toMatchObject({});
    expect(await db.get('posts')).toMatchObject({
      'post1': {
        "id": "post1",
        "userId": "user1",
        "content": "Hello"
      },
      'post2': {
        "id": "post2",
        "userId": "user2",
        "content": "Howdy!",
        "reply": "post1"
      }
    });
    expect(await db.get('likes')).toMatchObject({});

    await db.clear('');
    await db.set('', sampleData);
  });

  it('gets record entries by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.entries('users/user1')).toMatchObject([
      ["id", "user1"],
      ["fName", "John"],
      ["lName", "Doe"],
      ["age", 30]
    ]);
    expect(await db.entries('likes/likes1')).toBeUndefined();
  });

  it('gets table entries by keys', async () => {
    const db = await createDatabase({
      name: 'test',
      path: join(__dirname, 'data')
    });

    expect(await db.entries('users')).toMatchObject([
      [
        'user1', {
          "id": "user1",
          "fName": "John",
          "lName": "Doe",
          "age": 30
        }
      ],
      [
        'user2', {
          "id": "user2",
          "fName": "Gigi",
          "lName": "Duru",
          "age": 33,
          "peers": [
            "user1"
          ]
        }
      ]
    ]);
    expect(await db.entries('likes')).toMatchObject([]);
  });

});