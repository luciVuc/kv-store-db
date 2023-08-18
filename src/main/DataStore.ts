import { EventEmitter } from 'events';
import { DataRecord } from './DataRecord';

/**
 * A Data Collection Map. It maps data collection names to data collection objects.
 *
 * @export
 * @class DataCollectionMap
 * @extends {Map<string, TDataCollectionEntry>}
 */
export class DataCollectionMap extends Map<string, TDataCollectionEntry> { };

/**
 * A map of data collection objects, with functionality to perform CRUD
 * operations on them or their content data.
 *
 * @export
 * @class DataStore
 */
export class DataStore {
  #eventEmitter = new EventEmitter();
  #collections = new DataCollectionMap();

  /**
   * Returns the entire store data as a JSON object.
   *
   * @private
   * @returns
   * @memberof DataStore
   */
  private serialize() {
    const data = {} as any;
    this.collections.forEach((tbl, x) => {
      data[tbl] = {};
      Object.entries(this.#collections.get(tbl) || {} as TDataCollectionEntry).forEach(([key, value]) => {
        data[tbl][key] = value instanceof DataRecord ? value.toJSON() : value;
      });
    });
    return data as object;
  }

  /**
   * Deserializes the data given as JSON object, and uses it
   * to initialize or update the internal `collections` map.
   *
   * @private
   * @param {TDataStoreContent} [data]
   * @returns
   * @memberof DataStore
   */
  private deserialize(data?: TDataStoreContent) {
    if (data) {
      // TODO: improve performance
      Object.entries(data).forEach(([collectionName, collection]) => {
        Object.entries(collection).forEach(([entryId, entry]) => {
          Object.entries(entry).forEach(([fieldName, value]) => {
            this.set(`${collectionName}/${entryId}/${fieldName}`, value);
          });
        });
      });
    }
    return this;
  }

  /**
   *Creates an instance of DataStore.
   * @param {IDataStoreProps} { data } Initialization properties.
   * @param {object} props.data  A JSON object containing initial data as `collections`,
   * `collection entries` and `data fields`. A typical format looks like:
   * ```js
   * {
   *   collectionName1: {
   *     recId1: {
   *       fieldName1: value1,
   *       fieldName2: value2,
   *       ...
   *       fieldNameN: valueN,
   *     },
   *     recId2: {
   *       ...
   *     },
   *     ...
   *   },
   *   collectionName2: {
   *     recId: {
   *       fieldName: value,
   *       ...
   *     },
   *     ...
   *   },
   *   ...
   * }
   * ```
   * @memberof DataStore
   */
  constructor({ data }: IDataStoreProps) {
    this.deserialize(data);
  }

  /**
   * Adds the 'onChange' `listener` to the listeners array.
   * No checks are made to see if the `listener` has already been added.
   * @param onChange change event listener
   */
  addChangeListener(onChange: (data: { type: 'set' | 'update' | 'delete'; key: string; value: any; }) => void) {
    if (!this.changeListeners.includes(onChange)) {
      this.#eventEmitter.addListener('change', onChange);
    }
    return this;
  }

  /**
   * Removes the specified 'change' `listener` from the listener array.
   * @param onChange 
   */
  removeChangeListener(onChange: (data: { type: 'set' | 'update' | 'delete'; key: string; value: any; }) => void) {
    this.#eventEmitter.removeListener('change', onChange);
    return this;
  }

  /**
   * Synchronously calls all registered 'change' listeners, in the order they were registered,
   * passing the supplied arguments to each, and returns `true` if there were any 'change' event
   * listeners, or `false` otherwise.
   * @param data 
   */
  emitChange(data: { type: 'set' | 'update' | 'delete'; key: string; value: any; }) {
    this.#eventEmitter.emit('change', data);
  }

  /**
   * Returns an array containing all 'change' listeners.
   * @readonly
   * @memberof DataStore
   */
  get changeListeners() {
    return this.#eventEmitter.listeners('change');
  }

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
   * @memberof DataStore
   */
  set(key: string, value: any, merge?: boolean) {
    const keys = key.split('/');
    const [collectionName, entryId, typeField] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim(),
      (keys[2] as string)?.replace('/', '_')?.trim()
    ];

    if (typeField && entryId && collectionName) {
      // set the field
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      const entry = collection[entryId] || new DataRecord({}, entryId);

      entry.set(typeField, value);
      collection[entryId] = entry;
      this.#collections.set(collectionName, collection);
      this.emitChange({ type: 'set', key, value: this.get(key) });
    } else if (entryId && collectionName && value instanceof Object) {
      // set the type by id
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      const entry = collection[entryId] && merge ? new DataRecord({
        ...collection[entryId]?.toJSON(),
        ...value
      }, entryId) : new DataRecord({ ...value }, entryId);

      collection[entryId] = entry;
      this.#collections.set(collectionName, collection);
      this.emitChange({ type: 'set', key, value: this.get(key) });
    } else if (collectionName && value instanceof Object) {
      // set the collection
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      const entry = new DataRecord({ ...value }, value?.id || value?.uuid);

      collection[entry.uuid] = entry;
      this.#collections.set(collectionName, collection);
      this.emitChange({ type: 'set', key, value: this.get(key) });
    } else if (value instanceof Object) {
      this.deserialize(value as TDataStoreContent);
      this.emitChange({ type: 'set', key, value: this.get(key) });
    }
    return this;
  }

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
   * `fieldName`it returns the value of the named field in the identified record (entry)
   * in the collection.
   * If the key does not identify any collection, record or field in the store,
   * it returns `undefined`.
   *
   * @param {string} key
   * @returns
   * @memberof DataStore
   */
  get(key: string) {
    const keys = key.split('/');
    const [collectionName, entryId, typeField] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim(),
      (keys[2] as string)?.replace('/', '_')?.trim()
    ];

    if (!collectionName.length || collectionName === '*') {
      return this.serialize();
    } else if (typeField && entryId && collectionName) {
      // get the field
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      return collection?.[entryId]?.get(typeField) as any;
    } else if (entryId && collectionName) {
      // get the type by id
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      return collection?.[entryId]?.toJSON() as object;
    } else if (collectionName) {
      // get the collection
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      const collectionData = {} as any;
      Object.entries(collection).forEach(([key, value]) => {
        collectionData[key] = value instanceof DataRecord ? value.toJSON() : value;
      });
      return collectionData as object;
    }
  }

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
   * @memberof DataStore
   */
  has(key: string) {
    const keys = key.split('/');
    const [collectionName, entryId, typeField] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim(),
      (keys[2] as string)?.replace('/', '_')?.trim()
    ];

    if (typeField && entryId && collectionName) {
      // get the field
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      return !!(collection?.[entryId]?.has(typeField));
    } else if (entryId && collectionName) {
      // get the type by id
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      return !!(collection?.[entryId]);
    } else if (collectionName) {
      // get the collection
      return this.#collections.has(collectionName);
    }
    return false;
  }

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
   * @memberof DataStore
   */
  delete(key: string) {
    const keys = key.split('/');
    const [collectionName, entryId, typeField] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim(),
      (keys[2] as string)?.replace('/', '_')?.trim()
    ];

    let ret = false;

    if (typeField && entryId && collectionName) {
      // delete the field
      const collection = this.#collections.get(collectionName);
      ret = !!(collection?.[entryId]?.delete(typeField));
    } else if (entryId && collectionName) {
      // delete the type by id
      const collection = this.#collections.get(collectionName);
      ret = !!(delete collection?.[entryId]);
    } else if (collectionName) {
      // delete the collection
      ret = this.#collections.delete(collectionName);
    }
    if (ret) {
      this.emitChange({ type: 'delete', key, value: this.get(key) });
    }
    return ret;
  }

  /**
   * Clears the collection or collection record identified by key in the store.
   * The key is a string in a format like `collectionName/:recId`,
   * where the `collectionName` is the identifier of a collection in the store,
   * while the `recId` identifies a specific record (entry) in the
   * data collection.
   *
   * @param {string} key
   * @returns
   * @memberof DataStore
   */
  clear(key: string) {
    const keys = key.split('/');
    const [collectionName, entryId] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim()
    ];

    if (!collectionName.length || collectionName === '*') {
      this.#collections.clear();
      this.emitChange({ type: 'delete', key, value: this.get(key) });
    } else if (entryId && collectionName) {
      // clear the type by id
      const collection = this.#collections.get(collectionName);
      collection?.[entryId]?.clear();
      this.emitChange({ type: 'delete', key, value: this.get(key) });
    } else if (collectionName) {
      // clear the collection
      this.#collections.set(collectionName, {});
      this.emitChange({ type: 'delete', key, value: this.get(key) });
    }
    return this;
  }

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
   * @memberof DataStore
   */
  entries(key: string) {
    const keys = key.split('/');
    const [collectionName, entryId] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim()
    ];

    if (entryId && collectionName) {
      // entries the type by id
      const collection = this.#collections.get(collectionName);
      return collection?.[entryId] && Object.entries(collection?.[entryId].toJSON());
    } else if (collectionName) {
      // entries the collection
      const collection = this.#collections.get(collectionName) || {} as TDataCollectionEntry;
      const collectionData = {} as any;
      Object.entries(collection).forEach(([key, value]) => {
        collectionData[key] = value instanceof DataRecord ? value.toJSON() : value;
      });
      return Object.entries(collectionData);
    }
  }

  /**
   * Returns the data collection object with the given name, or `undefined`
   * if the collection does not exist in the store.
   *
   * @param {string} name
   * @returns
   * @memberof DataStore
   */
  collection(name: string) {
    return this.#collections.get(name);
  }

  /**
   * Returns an array containing the names of all data collections in the store.
   */
  get collections() {
    const collections = [] as string[];
    const itr = this.#collections.keys();

    for (let i = 0; i < this.#collections.size; i++) {
      collections.push(itr.next().value);
    }
    return collections;
  }
}
export default DataStore;