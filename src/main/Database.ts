import { join } from 'path';
import { constants, watchFile, mkdirSync } from 'fs';
import { access, readFile, writeFile } from 'fs/promises';
import { DataStore } from './DataStore';

/**
 * Create a database instance using the given data file.
 * If the data file does not exist, it will be created.
 *
 * @export
 * @param {IDatabaseProps} { name, path, onChange }
 * @param {string} name - The name of the database file
 * @param {string} path - The path where the database file will be stored
 * @param {Function} [onChange] - Optional callback that will be called when data changes
 * @returns {Promise<IDatabase>} A promise that resolves to the database instance
 */
export async function initDatabase({ name, path, onChange }: IDatabaseProps) {
  let store: DataStore;
  const dataFile = join(path, `${name}.json`);

  const loadData = async (): Promise<object> => {
    try {
      const data = await readFile(dataFile, 'utf-8');
      return JSON.parse(data) as object;
    } catch (error) {
      console.error(`Error loading data from ${dataFile}:`, error);
      return {};
    }
  };

  try {
    await access(dataFile, constants.R_OK | constants.W_OK);
  } catch {
    mkdirSync(path, { recursive: true });
    await writeFile(dataFile, '{}', 'utf-8');
  }

  return await (async () => {
    const data = await loadData() as TDataStoreContent;
    store = new DataStore({ data });

    watchFile(dataFile, async () => {
      store.set('', (await loadData()));
    });

    if (onChange) {
      store.addChangeListener(onChange);
    }

    return {
      /**
       * Sets a (new or existing) value by key in the store.
       * The key is a string in a format like `collectionName/:recId/:fieldName`,
       * where the `collectionName` is the identifier of a collection in the store,
       * while the `recId` identifies a specific record (entry) in the
       * data collection, and the `fieldName` identifies a specific field of the
       * specific record (entry) in the data collection.
       * Both `recId` and `fieldName` are optional, and if not provided,
       * the key is assumed to indicate the name of the collection. In this case,
       * the value is expected to be an object that contains the new data entries
       * for the collection (a `TDataCollectionEntry` compatible object).
       * However, if the key contains both `collectionName` and `recId` components,
       * it is assumed to refer to a particular record (entry) in the collection.
       * In this case the value must be a data collection entry (a object compatible
       * with a `Map` of `TDataRecord` items).
       * If the key contains all three components, it is assumed to refer to a
       * specific data field of the given record (entry) in the data collection.
       * The `merge` flag is optional as well, and it serves when setting
       * entries (records) in a collection, (e.g. using the `collectionName/:recId` key variant),
       * to indicate whether to merge the new fields with the existing fields
       * of the identified record in the collection, or to replace all its existing
       * fields with the new ones. By default `merge` is `false`, which means
       * that the new data fields passed as `value`  replace the existing ones.
       *
       * @param {string} key
       * @param {*} value
       * @param {boolean} [merge]
       * @returns
       */
      async set(key: string, value: any, merge?: boolean) {
        store.set(key, value, merge);
        await writeFile(dataFile, JSON.stringify(store.get('')));
        return store.get(key);
      },

      /**
       * Gets (retrieves) the data of the collection, record or the field identified
       * by the given key in the store.
       * The key is a string in this `collectionName/:recId/:fieldName` format,
       * where the `collectionName` is required and is the collection identifier.
       * The `recId`, which is optional, is the identifier of the record (entry)
       * in the collection, and the `fieldName`, optional as well, is the identifier
       * of a particular field of the given record (entry) in the collection.
       * If the given key only contains the `collectionName` it returns all the data
       * from the collection identified. If the given key only contains the `collectionName` and
       * the `recId` it returns the data of the identified record (entry) in the collection.
       * If the given key only all three components, the `collectionName`, the `recId` and
       * `fieldName`it returns the value of the named field in the identified entry
       * (record) in the collection.
       * If the key does not identify any collection, record or field in the store,
       * it returns `undefined`.
       *
       * @param {string} key
       * @returns
       */
      async get(key: string) {
        return store.get(key);
      },

      /**
       * Returns `true` if the store has a collection, a collection record or a collection
       * record field that is identified by the given key.
       * The key is a string in this `collectionName/:recId/:fieldName` format,
       * where the `collectionName` is required and is the collection identifier.
       * The `recId`, which is optional, is the identifier of the record (entry)
       * in the collection, and the `fieldName`, optional as well, is the identifier
       * of a particular field of the given record (entry) in the collection.
       * If the key does not identify any collection, record or field in the store,
       * it returns `false`.
       *
       * @param {string} key
       * @returns
       */
      async has(key: string) {
        return store.has(key);
      },

      /**
       * Deletes from the store the collection, record or data field specified by the key,
       * and returns `true` to indicate that the operation is successful.
       * The key is a string in this `collectionName/:recId/:fieldName` format,
       * where the `collectionName` is required and is the collection identifier.
       * The `recId`, which is optional, is the identifier of the record (entry)
       * in the collection, and the `fieldName`, optional as well, is the identifier
       * of a particular field of the given record (entry) in the collection.
       * If the key does not identify any collection, record or field in the store,
       * it returns `false`, indicating that nothing was deleted.
       *
       * @param {string} key
       * @returns
       */
      async delete(key: string) {
        const value = store.delete(key);
        await writeFile(dataFile, JSON.stringify(store.get('')));
        return value;
      },

      /**
       * Clears the collection or collection record identified by key in the store.
       * The key is a string in a format like `collectionName/:recId`,
       * where the `collectionName` is the identifier of a collection in the store,
       * while the `recId` identifies a specific record (entry) in the
       * data collection.
       *
       * @param {string} key
       * @returns
       */
      async clear(key: string) {
        const value = store.clear(key);
        await writeFile(dataFile, JSON.stringify(store.get('')));
        return value;
      },

      /**
       * Returns an iterator with all entries of the collection or record identified
       * by the key in the store.
       * The key is a string in a format like `collectionName/:recId`,
       * where the `collectionName` is the identifier of a collection in the store,
       * while the `recId` identifies a specific record (entry) in the
       * data collection.
       *
       * @param {string} key
       * @returns
       */
      async entries(key: string) {
        return store.entries(key);
      },

      /**
       * Returns the data collection object with the given name, or `undefined`
       * if the collection does not exist in the store.
       *
       * @param {string} name
       * @returns
       */
      async collection(name: string) {
        return store.collection(name);
      },

      /**
       * Returns an array containing the names of all data collections in the store.
       */
      get collections() {
        return store.collections as string[];
      },

      /**
       * Returns the name and path of the data file.
       */
      get dataFile() {
        return dataFile;
      }
    } as IDatabase;
  })();
}

const dbsMap = new Map<string, IDatabase>();

/**
 * Create a database instance using the given data file.
 * If the data file does not exist, it will be created.
 *
 * @export
 * @param {IDatabaseProps} params
 * @returns
 */
export async function createDatabase(params: IDatabaseProps) {
  const { name, path } = params;
  const dataFile = join(path, `${name}.json`);
  if (!dbsMap.has(dataFile)) {
    dbsMap.set(dataFile, await initDatabase(params));
  }
  return dbsMap.get(dataFile) as IDatabase;
};

export default createDatabase;
