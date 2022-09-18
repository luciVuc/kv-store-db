import { DataTypeMap } from '../main';
import { users } from './data/sample.json';

describe('DataTypeMap', () => {
  it('initializes with default args', async () => {
    const type = new DataTypeMap();
    expect(type.toJSON()).toEqual({});
    expect(type.uuid.length).toBeGreaterThan(0);
  });

  it('initializes with no data args but given UUID', async () => {
    const type = new DataTypeMap({}, '12345');
    expect(type.toJSON()).toEqual({});
    expect(type.uuid).toEqual('12345');
  });

  it('initializes with data args and default UUID', async () => {
    const type = new DataTypeMap(users.user1);
    expect(type.toJSON()).toEqual(users.user1);
    expect(type.uuid.length).toBeGreaterThan(0);
  });

  it('initializes with data args and default UUID', async () => {
    const type = new DataTypeMap(users.user1, users.user1.id);

    expect(type.get('id')).toEqual('user1');
    expect(type.get('fName')).toEqual('John');
    expect(type.get('lName')).toEqual('Doe');
    expect(type.get('age')).toEqual(30);
    expect(type.toJSON()).toEqual(users.user1);
    expect(type.uuid).toEqual(type.get('id'));
  });

  it('can change initial values of data fields', async () => {
    const type = new DataTypeMap(users.user1, users.user1.id);

    expect(type.get('id')).toEqual('user1');
    expect(type.get('fName')).toEqual('John');
    expect(type.get('lName')).toEqual('Doe');
    expect(type.get('age')).toEqual(30);
    expect(type.toJSON()).toEqual(users.user1);
    expect(type.uuid).toEqual(type.get('id'));

    type.set('fName', 'Donald');
    type.set('lName', 'Trump');
    type.set('age', 74);

    expect(type.get('id')).toEqual('user1');
    expect(type.get('fName')).toEqual('Donald');
    expect(type.get('lName')).toEqual('Trump');
    expect(type.get('age')).toEqual(74);
  });

  it('can add a new data fields', async () => {
    const type = new DataTypeMap(users.user1, users.user1.id);

    expect(type.toJSON()).toEqual(users.user1);
    expect(type.uuid).toEqual(type.get('id'));

    type.set('tmp', 123);

    expect(type.toJSON()).toEqual({ ...users.user1, tmp: 123 });
  });


  it('can remove a data fields', async () => {
    const type = new DataTypeMap(users.user1, users.user1.id);

    expect(type.toJSON()).toEqual(users.user1);
    expect(type.uuid).toEqual(type.get('id'));

    type.delete('age');

    expect(type.toJSON()).toEqual({
      id: users.user1.id,
      fName: users.user1.fName,
      lName: users.user1.lName
    });
  });

  it('can clear the data fields', async () => {
    const type = new DataTypeMap(users.user1, users.user1.id);

    expect(type.toJSON()).toEqual(users.user1);
    expect(type.uuid).toEqual(type.get('id'));

    type.clear();

    expect(type.toJSON()).toEqual({});
    expect(type.uuid).toEqual(users.user1.id);
  });


  it('supports other Map functionality', async () => {
    const type = new DataTypeMap(users.user1, users.user1.id);

    expect(type.toJSON()).toEqual(users.user1);
    expect(type.uuid).toEqual(type.get('id'));
    expect(type.size).toEqual(4);

    const keysItr = type.keys();
    expect(keysItr.next().value).toEqual('id');
    expect(keysItr.next().value).toEqual('fName');
    expect(keysItr.next().value).toEqual('lName');
    expect(keysItr.next().value).toEqual('age');

    const valuesItr = type.values();
    expect(valuesItr.next().value).toEqual('user1');
    expect(valuesItr.next().value).toEqual('John');
    expect(valuesItr.next().value).toEqual('Doe');
    expect(valuesItr.next().value).toEqual(30);

    const entries = type.entries();
    expect(entries.next().value).toEqual(['id', 'user1']);
    expect(entries.next().value).toEqual(['fName', 'John']);
    expect(entries.next().value).toEqual(['lName', 'Doe']);
    expect(entries.next().value).toEqual(['age', 30]);
  });
});