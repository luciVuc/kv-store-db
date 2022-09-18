/**
 * A generic datatype. It consists of key-value pairs, as data fields
 * with values of any primitive type and keys as strings to identify them.
 */
declare type TDataRecord = {
  [field: string]: any;
};

/**
 * A hashtable of data records (`TDataRecord`), which represents a single
 * entry in a Data Table object.
 */
declare type TDataTableEntry = {
  [id: string]: TDataRecord;
}

/**
 * A hashtable of data table entries (`TDataTableEntry`).
 */
declare type TDataStoreContent = {
  [table: string]: TDataTableEntry;
};

/**
 * Defines the instance data to pass to the `DataStore` constructor.
 */
declare interface IDataStoreProps {
  data?: TDataStoreContent;
}

/**
 * Defines the public API of the library.
 */
declare interface IDatabase {
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
   */
  set(key: string, value: any, merge?: boolean): Promise<any>;

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
   */
  get(key: string): Promise<any>;

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
   */
  has(key: string): Promise<boolean>;

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
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clears the table or table record identified by key in the store.
   * The key is a string in a format like `tableName/:rowId`,
   * where the `tableName` is the identifier of a table in the store,
   * while the `rowId` identifies a specific record (entry) in the
   * data table.
   *
   * @param {string} key
   * @returns
   */
  clear(key: string): Promise<any>;

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
   */
  entries(key: string): Promise<[string, any][]>;

  /**
   * Returns the data table object with the given name, or `undefined`
   * if the table does not exist in the store.
   *
   * @param {string} name
   * @returns
   */
  table(name: string): Promise<TDataTableEntry | undefined>;

  /**
   * Returns an array containing the names of all data tables in the store.
   */
  get tables(): string[];

  /**
   * Returns the name and path of the data file.
   */
  get dataFile(): string;
};
