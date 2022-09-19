import { EventEmitter } from 'events';
import { DataTypeMap } from './DataTypeMap';

/**
 * A Data Table Map. It maps table names to "table" objects.
 *
 * @export
 * @class DataTableMap
 * @extends {Map<string, TDataTableEntry>}
 */
export class DataTableMap extends Map<string, TDataTableEntry> { };

/**
 * A map of data table objects, with functionality to perform CRUD
 * operations on them or their content data.
 *
 * @export
 * @class DataStore
 */
export class DataStore {
  private _eventEmitter = new EventEmitter();
  private _tables = new DataTableMap();

  /**
   * Returns the entire store data as a JSON object.
   *
   * @private
   * @returns
   * @memberof DataStore
   */
  private serialize() {
    const data = {} as any;
    this.tables.forEach((tbl, x) => {
      data[tbl] = {};
      Object.entries(this._tables.get(tbl) || {} as TDataTableEntry).forEach(([key, value]) => {
        data[tbl][key] = value instanceof DataTypeMap ? value.toJSON() : value;
      });
    });
    return data as object;
  }

  /**
   * Deserializes the data given as JSON object, and uses it
   * to initialize or update the internal `tables` map.
   *
   * @private
   * @param {TDataStoreContent} [data]
   * @returns
   * @memberof DataStore
   */
  private deserialize(data?: TDataStoreContent) {
    if (data) {
      // TODO: improve performance
      Object.entries(data).forEach(([tableName, table]) => {
        Object.entries(table).forEach(([entryId, entry]) => {
          Object.entries(entry).forEach(([fieldName, value]) => {
            this.set(`${tableName}/${entryId}/${fieldName}`, value);
          });
        });
      });
    }
    return this;
  }

  /**
   *Creates an instance of DataStore.
   * @param {IDataStoreProps} { data } Initialization properties.
   * @param {object} props.data  A JSON object containing initial data as `tables`,
   * `table entries` and `data fields`. A typical format looks like:
   * ```js
   * {
   *   tableName1: {
   *     rowId1: {
   *       fieldName1: value1,
   *       fieldName2: value2,
   *       ...
   *       fieldNameN: valueN,
   *     },
   *     rowId2: {
   *       ...
   *     },
   *     ...
   *   },
   *   tableName2: {
   *     rowId: {
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
      this._eventEmitter.addListener('change', onChange);
    }
    return this;
  }

  /**
   * Removes the specified 'change' `listener` from the listener array.
   * @param onChange 
   */
  removeChangeListener(onChange: (data: { type: 'set' | 'update' | 'delete'; key: string; value: any; }) => void) {
    this._eventEmitter.removeListener('change', onChange);
    return this;
  }

  /**
   * Synchronously calls all registered 'change' listeners, in the order they were registered,
   * passing the supplied arguments to each, and returns `true` if there were any 'change' event
   * listeners, or `false` otherwise.
   * @param data 
   */
  emitChange(data: { type: 'set' | 'update' | 'delete'; key: string; value: any; }) {
    this._eventEmitter.emit('change', data);
  }

  /**
   * Returns an array containing all 'change' listeners.
   * @readonly
   * @memberof DataStore
   */
  get changeListeners() {
    return this._eventEmitter.listeners('change');
  }

  /**
   * Sets a (new or existing) value by key in the store.
   * The key is a string in a format like `tableName/:rowId/:fieldName`,
   * where the `tableName` is the identifier of a table in the store,
   * while the `rowId` identifies a specific record (entry) in the
   * data table, and the `fieldName` identifies a specific field of the
   * specific record (entry) in the data table.
   * Both `rowId` and `fieldName` are optional, and if not provided,
   * the key is assumed to indicate the name of the table. In this case,
   * the value is expected to be an object that contains the new data entries
   * for the table (a `TDataTableEntry` compatible object).
   * However, if the key contains both `tableName` and `rowId` components,
   * it is assumed to refer to a particular entry (record) in the table.
   * In this case the value must be a data table entry (a object compatible
   * with a `Map` of `TDataRecord` items).
   * If the key contains all three components, it is assumed to refer to a
   * specific data field of the given record (entry) in the data table.
   * The `merge` flag is optional as well, and it serves when setting
   * entries (records) in a table, (e.g. using the `tableName/:rowId` key variant),
   * to indicate whether to merge the new fields with the existing fields
   * of the identified record in the table, or to replace all its existing
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
    const [tableName, entryId, typeField] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim(),
      (keys[2] as string)?.replace('/', '_')?.trim()
    ];

    if (typeField && entryId && tableName) {
      // set the field
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      const entry = table[entryId] || new DataTypeMap({}, entryId);

      entry.set(typeField, value);
      table[entryId] = entry;
      this._tables.set(tableName, table);
      this.emitChange({ type: 'set', key, value: this.get(key) });
    } else if (entryId && tableName && value instanceof Object) {
      // set the type by id
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      const entry = table[entryId] && merge ? new DataTypeMap({
        ...table[entryId]?.toJSON(),
        ...value
      }, entryId) : new DataTypeMap({ ...value }, entryId);

      table[entryId] = entry;
      this._tables.set(tableName, table);
      this.emitChange({ type: 'set', key, value: this.get(key) });
    } else if (tableName && value instanceof Object) {
      // set the table
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      const entry = new DataTypeMap({ ...value }, value?.id || value?.uuid);

      table[entry.uuid] = entry;
      this._tables.set(tableName, table);
      this.emitChange({ type: 'set', key, value: this.get(key) });
    } else if (value instanceof Object) {
      this.deserialize(value as TDataStoreContent);
      this.emitChange({ type: 'set', key, value: this.get(key) });
    }
    return this;
  }

  /**
   * Gets (retrieves) the data of the table, record or the field identified
   * by the given key in the store.
   * The key is a string in this `tableName/:rowId/:fieldName` format,
   * where the `tableName` is required and is the table identifier.
   * The `rowId`, which is optional, is the identifier of the record (row)
   * in the table, and the `fieldName`, optional as well, is the identifier
   * of a particular field of the given record (row) in the table.
   * If the given key only contains the `tableName` it returns all the data
   * from the table identified. If the given key only contains the `tableName` and
   * the `rowId` it returns the data of the identified row (record) in the table.
   * If the given key only all three components, the `tableName`, the `rowId` and
   * `fieldName`it returns the value of the named field in the identified row
   * (record) in the table.
   * If the key does not identify any table, record or field in the store,
   * it returns `undefined`.
   *
   * @param {string} key
   * @returns
   * @memberof DataStore
   */
  get(key: string) {
    const keys = key.split('/');
    const [tableName, entryId, typeField] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim(),
      (keys[2] as string)?.replace('/', '_')?.trim()
    ];

    if (!tableName.length || tableName === '*') {
      return this.serialize();
    } else if (typeField && entryId && tableName) {
      // get the field
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      return table?.[entryId]?.get(typeField) as any;
    } else if (entryId && tableName) {
      // get the type by id
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      return table?.[entryId]?.toJSON() as object;
    } else if (tableName) {
      // get the table
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      const tableData = {} as any;
      Object.entries(table).forEach(([key, value]) => {
        tableData[key] = value instanceof DataTypeMap ? value.toJSON() : value;
      });
      return tableData as object;
    }
  }

  /**
   * Returns `true` if the store has a table, a table record or a table
   * record field that is identified by the given key.
   * The key is a string in this `tableName/:rowId/:fieldName` format,
   * where the `tableName` is required and is the table identifier.
   * The `rowId`, which is optional, is the identifier of the record (row)
   * in the table, and the `fieldName`, optional as well, is the identifier
   * of a particular field of the given record (row) in the table.
   * If the key does not identify any table, record or field in the store,
   * it returns `false`.
   *
   * @param {string} key
   * @returns
   * @memberof DataStore
   */
  has(key: string) {
    const keys = key.split('/');
    const [tableName, entryId, typeField] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim(),
      (keys[2] as string)?.replace('/', '_')?.trim()
    ];

    if (typeField && entryId && tableName) {
      // get the field
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      return !!(table?.[entryId]?.has(typeField));
    } else if (entryId && tableName) {
      // get the type by id
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      return !!(table?.[entryId]);
    } else if (tableName) {
      // get the table
      return this._tables.has(tableName);
    }
    return false;
  }

  /**
   * Deletes from the store the table, record or data field specified by the key,
   * and returns `true` to indicate that the operation is successful.
   * The key is a string in this `tableName/:rowId/:fieldName` format,
   * where the `tableName` is required and is the table identifier.
   * The `rowId`, which is optional, is the identifier of the record (row)
   * in the table, and the `fieldName`, optional as well, is the identifier
   * of a particular field of the given record (row) in the table.
   * If the key does not identify any table, record or field in the store,
   * it returns `false`, indicating that nothing was deleted.
   *
   * @param {string} key
   * @returns
   * @memberof DataStore
   */
  delete(key: string) {
    const keys = key.split('/');
    const [tableName, entryId, typeField] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim(),
      (keys[2] as string)?.replace('/', '_')?.trim()
    ];

    let ret = false;

    if (typeField && entryId && tableName) {
      // delete the field
      const table = this._tables.get(tableName);
      ret = !!(table?.[entryId]?.delete(typeField));
    } else if (entryId && tableName) {
      // delete the type by id
      const table = this._tables.get(tableName);
      ret = !!(delete table?.[entryId]);
    } else if (tableName) {
      // delete the table
      ret = this._tables.delete(tableName);
    }
    if (ret) {
      this.emitChange({ type: 'delete', key, value: this.get(key) });
    }
    return ret;
  }

  /**
   * Clears the table or table record identified by key in the store.
   * The key is a string in a format like `tableName/:rowId`,
   * where the `tableName` is the identifier of a table in the store,
   * while the `rowId` identifies a specific record (entry) in the
   * data table.
   *
   * @param {string} key
   * @returns
   * @memberof DataStore
   */
  clear(key: string) {
    const keys = key.split('/');
    const [tableName, entryId] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim()
    ];

    if (!tableName.length || tableName === '*') {
      this._tables.clear();
      this.emitChange({ type: 'delete', key, value: this.get(key) });
    } else if (entryId && tableName) {
      // clear the type by id
      const table = this._tables.get(tableName);
      table?.[entryId]?.clear();
      this.emitChange({ type: 'delete', key, value: this.get(key) });
    } else if (tableName) {
      // clear the table
      this._tables.set(tableName, {});
      this.emitChange({ type: 'delete', key, value: this.get(key) });
    }
    return this;
  }

  /**
   * Returns an iterator with all entries of the table or record identified
   * by the key in the store.
   * The key is a string in a format like `tableName/:rowId`,
   * where the `tableName` is the identifier of a table in the store,
   * while the `rowId` identifies a specific record (entry) in the
   * data table.
   *
   * @param {string} key
   * @returns
   * @memberof DataStore
   */
  entries(key: string) {
    const keys = key.split('/');
    const [tableName, entryId] = [
      (keys[0] as string)?.trim(),
      (keys[1] as string)?.trim()
    ];

    if (entryId && tableName) {
      // entries the type by id
      const table = this._tables.get(tableName);
      return table?.[entryId] && Object.entries(table?.[entryId].toJSON());
    } else if (tableName) {
      // entries the table
      const table = this._tables.get(tableName) || {} as TDataTableEntry;
      const tableData = {} as any;
      Object.entries(table).forEach(([key, value]) => {
        tableData[key] = value instanceof DataTypeMap ? value.toJSON() : value;
      });
      return Object.entries(tableData);
    }
  }

  /**
   * Returns the data table object with the given name, or `undefined`
   * if the table does not exist in the store.
   *
   * @param {string} name
   * @returns
   * @memberof DataStore
   */
  table(name: string) {
    return this._tables.get(name);
  }

  /**
   * Returns an array containing the names of all data tables in the store.
   */
  get tables() {
    const tables = [] as string[];
    const itr = this._tables.keys();

    for (let i = 0; i < this._tables.size; i++) {
      tables.push(itr.next().value);
    }
    return tables;
  }
}
export default DataStore;