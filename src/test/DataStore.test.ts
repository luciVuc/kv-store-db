import { DataStore, DataTypeMap } from '../main';
import sampleData from './data/sample.json';

describe('DataStore', () => {
  it('initializes with default args', async () => {
    const store = new DataStore({});
    expect(store.tables).toEqual([]);
  });

  it('initializes with sample data args', async () => {
    const store = new DataStore({ data: sampleData });
    expect(store.tables).toEqual(['users', 'posts']);
  });

  it('gets the tables', async () => {
    const store = new DataStore({ data: sampleData });
    expect(store.tables).toEqual(['users', 'posts']);

    expect(store.table('users')).toMatchObject({
      'user1': new DataTypeMap({
        "id": "user1",
        "fName": "John",
        "lName": "Doe",
        "age": 30
      }, 'user1')
    });

    expect(store.table('users')).toMatchObject({
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

    expect(store.table('posts')).toMatchObject({
      "post1": new DataTypeMap({
        "id": "post1",
        "userId": "user1",
        "content": "Hello"
      }, 'post1')
    });

    expect(store.table('posts')).toMatchObject({
      "post2": new DataTypeMap({
        "id": "post2",
        "userId": "user2",
        "content": "Howdy!",
        "reply": "post1"
      }, 'post2')
    });
  });

  it('gets values by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users/user1/id')).toEqual('user1');
    expect(store.get('users/user1/fName')).toEqual('John');
    expect(store.get('users/user1/lName')).toEqual('Doe');
    expect(store.get('users/user1/age')).toEqual(30);
    expect(store.get('users/user1/fullName')).toBeUndefined();

    expect(store.get('users/user2/id')).toEqual('user2');
    expect(store.get('users/user2/fName')).toEqual('Gigi');
    expect(store.get('users/user2/lName')).toEqual('Duru');
    expect(store.get('users/user2/age')).toEqual(33);
  });

  it('gets records by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users/user1')).toMatchObject({
      "id": "user1",
      "fName": "John",
      "lName": "Doe",
      "age": 30
    });
    expect(store.get('users/user2')).toMatchObject({
      "id": "user2",
      "fName": "Gigi",
      "lName": "Duru",
      "age": 33,
      "peers": [
        "user1"
      ]
    });
    expect(store.get('posts/post1')).toMatchObject({
      "id": "post1",
      "userId": "user1",
      "content": "Hello"
    });
    expect(store.get('posts/post2')).toMatchObject({
      "id": "post2",
      "userId": "user2",
      "content": "Howdy!",
      "reply": "post1"
    });
    expect(store.get('posts/post3')).toBeUndefined();
  });

  it('gets tables by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users')).toMatchObject({
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
    expect(store.get('posts')).toMatchObject({
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
    expect(store.get('likes')).toMatchObject({});
  });

  it('gets all data by empty key', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('')).toMatchObject({
      ...sampleData
    });
    expect(store.get('*')).toMatchObject({
      ...sampleData
    });
  });

  it('sets values by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users/user1/id')).toEqual('user1');
    expect(store.get('users/user1/fName')).toEqual('John');
    expect(store.get('users/user1/lName')).toEqual('Doe');
    expect(store.get('users/user1/age')).toEqual(30);

    store.set('users/user1/id', 'USER1');
    store.set('users/user1/age', 31);
    store.set('users/USER1/age', 32);

    expect(store.get('users/user1/id')).toEqual('USER1');
    expect(store.get('users/user1/fName')).toEqual('John');
    expect(store.get('users/user1/lName')).toEqual('Doe');
    expect(store.get('users/user1/age')).toEqual(31);

    expect(store.get('users/USER1/id')).toBeUndefined();
    expect(store.get('users/USER1/fName')).toBeUndefined();
    expect(store.get('users/USER1/lName')).toBeUndefined();
    expect(store.get('users/USER1/age')).toEqual(32)
  });

  it('sets records by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users/user1')).toMatchObject({
      "id": "user1",
      "fName": "John",
      "lName": "Doe",
      "age": 30
    });
    expect(store.get('users/user2')).toMatchObject({
      "id": "user2",
      "fName": "Gigi",
      "lName": "Duru",
      "age": 33,
      "peers": [
        "user1"
      ]
    });
    expect(store.get('posts/post1')).toMatchObject({
      "id": "post1",
      "userId": "user1",
      "content": "Hello"
    });
    expect(store.get('posts/post2')).toMatchObject({
      "id": "post2",
      "userId": "user2",
      "content": "Howdy!",
      "reply": "post1"
    });

    expect(store.get('posts/post3')).toBeUndefined();
    expect(store.get('users/USER1')).toBeUndefined();

    store.set('posts/post3', {
      "id": "post3",
      "userId": "user2",
      "content": "Hey yall!",
      "reply": "post1"
    });

    store.set('users/USER1', {
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35,
      "peers": [
      ]
    });

    expect(store.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35,
      "peers": [
      ]
    });

    expect(store.get('posts/post3')).toMatchObject({
      "id": "post3",
      "userId": "user2",
      "content": "Hey yall!",
      "reply": "post1"
    });
  });

  it('sets records by keys - no merge', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users/USER1')).toBeUndefined();

    store.set('users/USER1', {
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35
    });

    expect(store.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35
    });

    store.set('users/USER1', {
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "peers": [
      ]
    });

    expect(store.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "peers": [
      ]
    });
  });

  it('sets records by keys - with merge', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users/USER1')).toBeUndefined();

    store.set('users/USER1', {
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35
    }, true);

    expect(store.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Forest",
      "lName": "Gump",
      "age": 35
    });

    store.set('users/USER1', {
      "id": "USER1",
      "fName": "Run Forest",
      "lName": "Gump",
      "peers": [
      ]
    }, true);

    expect(store.get('users/USER1')).toMatchObject({
      "id": "USER1",
      "fName": "Run Forest",
      "lName": "Gump",
      "age": 35,
      "peers": [
      ]
    });
  });

  it('sets tables by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users')).toMatchObject({
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
    expect(store.get('posts')).toMatchObject({
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
    expect(store.get('likes')).toMatchObject({});
    expect(store.tables).toMatchObject(['users', 'posts']);

    store.set('likes/like1', {
      'id': 'like1',
      'post': 'post1'
    });

    expect(store.get('users')).toMatchObject({
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
    expect(store.get('posts')).toMatchObject({
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
    expect(store.get('likes')).toMatchObject({
      'like1': {
        'id': 'like1',
        'post': 'post1'
      }
    });
    expect(store.tables).toMatchObject(['users', 'posts', 'likes']);
  });

  it('has values by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.has('users/user1/id')).toBe(true);
    expect(store.has('users/user1/fName')).toBe(true);
    expect(store.has('users/user1/lName')).toBe(true);
    expect(store.has('users/user1/age')).toBe(true);
    expect(store.has('users/user1/fullName')).toBe(false);
  });

  it('has records by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.has('users/user1')).toBe(true);
    expect(store.has('users/user2')).toBe(true);
    expect(store.has('users/user3')).toBe(false);
    expect(store.has('posts/post1')).toBe(true);
    expect(store.has('posts/post3')).toBe(false);
  });

  it('has tables by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.has('users')).toBe(true);
    expect(store.has('posts')).toBe(true);
    expect(store.has('likes')).toBe(false);
  });

  it('deletes values by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users/user1/id')).toEqual('user1');
    expect(store.get('users/user1/fName')).toEqual('John');
    expect(store.get('users/user1/lName')).toEqual('Doe');
    expect(store.get('users/user1/age')).toEqual(30);
    expect(store.get('users/user1/fullName')).toBeUndefined();

    expect(store.has('users/user1/id')).toBe(true);
    expect(store.has('users/user1/fName')).toBe(true);
    expect(store.has('users/user1/lName')).toBe(true);
    expect(store.has('users/user1/age')).toBe(true);
    expect(store.has('users/user1/fullName')).toBe(false);

    store.delete('users/user1/age');

    expect(store.get('users/user1/id')).toEqual('user1');
    expect(store.get('users/user1/fName')).toEqual('John');
    expect(store.get('users/user1/lName')).toEqual('Doe');
    expect(store.get('users/user1/age')).toBeUndefined();
    expect(store.get('users/user1/fullName')).toBeUndefined();

    expect(store.has('users/user1/id')).toBe(true);
    expect(store.has('users/user1/fName')).toBe(true);
    expect(store.has('users/user1/lName')).toBe(true);
    expect(store.has('users/user1/age')).toBe(false);
    expect(store.has('users/user1/fullName')).toBe(false);
  });

  it('deletes records by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.has('users/user1')).toBe(true);
    expect(store.has('users/user2')).toBe(true);
    expect(store.has('users/user3')).toBe(false);
    expect(store.has('posts/post1')).toBe(true);
    expect(store.has('posts/post3')).toBe(false);

    store.delete('users/user1');
    store.delete('users/user3');

    expect(store.has('users/user1')).toBe(false);
    expect(store.has('users/user2')).toBe(true);
    expect(store.has('users/user3')).toBe(false);
    expect(store.has('posts/post1')).toBe(true);
    expect(store.has('posts/post3')).toBe(false);
  });

  it('deletes tables by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.has('users')).toBe(true);
    expect(store.has('posts')).toBe(true);
    expect(store.has('likes')).toBe(false);

    store.delete('users');
    store.delete('likes');

    expect(store.has('users')).toBe(false);
    expect(store.has('posts')).toBe(true);
    expect(store.has('likes')).toBe(false);
  });

  it('clears records by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users/user1')).toMatchObject({
      "id": "user1",
      "fName": "John",
      "lName": "Doe",
      "age": 30
    });
    expect(store.get('users/user2')).toMatchObject({
      "id": "user2",
      "fName": "Gigi",
      "lName": "Duru",
      "age": 33,
      "peers": [
        "user1"
      ]
    });
    expect(store.has('likes/likes1')).toBe(false);

    store.clear('users/user1');
    store.clear('likes/like1');

    expect(store.get('users/user1')).toMatchObject({});
    expect(store.get('users/user2')).toMatchObject({
      "id": "user2",
      "fName": "Gigi",
      "lName": "Duru",
      "age": 33,
      "peers": [
        "user1"
      ]
    });
    expect(store.has('likes/like1')).toBe(false);
  });

  it('clears tables by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users')).toMatchObject({
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
    expect(store.get('posts')).toMatchObject({
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
    expect(store.get('likes')).toMatchObject({});

    store.clear('users');
    store.clear('likes');

    expect(store.get('users')).toMatchObject({});
    expect(store.get('posts')).toMatchObject({
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
    expect(store.get('likes')).toMatchObject({});
  });

  it('clears store', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.get('users')).toMatchObject({
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
    expect(store.get('posts')).toMatchObject({
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
    expect(store.get('likes')).toMatchObject({});

    store.clear('');
    // store.delete('likes');

    expect(store.get('users')).toMatchObject({});
    expect(store.get('posts')).toMatchObject({});
    expect(store.get('*')).toMatchObject({});
  });

  it('gets record entries by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.entries('users/user1')).toMatchObject([
      ["id", "user1"],
      ["fName", "John"],
      ["lName", "Doe"],
      ["age", 30]
    ]);
    expect(store.entries('likes/likes1')).toBeUndefined();
  });

  it('gets table entries by keys', async () => {
    const store = new DataStore({ data: sampleData });

    expect(store.entries('users')).toMatchObject([
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
    expect(store.entries('likes')).toMatchObject([]);
  });
});