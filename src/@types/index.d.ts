/**
 * A generic datatype. It consists of key-value pairs, as data fields
 * with values of any primitive type and keys as strings to identify them.
 */
declare type TDataRecord = {
  [fieldName: string]: any;
};

/**
 * A map of data records (`TDataRecord`), which represents entries
 * in a Data Collection, indexed by their record ID.
 */
declare type TDataCollectionEntry = {
  [recId: string]: TDataRecord;
}

/**
 * A map of data collection entries (`TDataCollectionEntry`), representing
 * the entire database content, indexed by collection names.
 */
declare type TDataStoreContent = {
  [collectionName: string]: TDataCollectionEntry;
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
   * The key is a string in a format like `collectionName/:recId/:fieldName`,
   * where the `collectionName` is the identifier of a collection in the store,
   * while the `recId` identifies a specific record (entry) in the
   * data collection, and the `fieldName` identifies a specific field of the
   * specified record (entry) in the data collection.
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
   * that the new data fields passed as `value` will replace the existing ones.
   *
   * @param {string} key
   * @param {*} value
   * @param {boolean} [merge]
   * @returns
   */
  set(key: string, value: any, merge?: boolean): Promise<any>;

  /**
   * Gets (retrieves) the data of the collection, record or the field identified
   * by the given key in the store.
   * The key is a string in this `collectionName/:recId/:fieldName` format,
   * where the `collectionName` is required and is the collection identifier.
   * The `recId`, which is optional, is the identifier of the record (entry)
   * in the collection, and the `fieldName`, optional as well, is the identifier
   * of a particular field of the given record (entry) in the collection.
   * If the given key only contains the `collectionName` it returns all the data
   * from the identified collection. If the given key only contains the `collectionName` and
   * the `recId` it returns the data of the identified record (entry) in the collection.
   * If the given key only all three components, the `collectionName`, the `recId` and
   * the `fieldName`, it returns the value of the named field in the identified entry
   * (record) in the collection.
   * If the key does not identify any collection, record or field in the store,
   * it returns `undefined`.
   *
   * @param {string} key
   * @returns
   */
  get(key: string): Promise<any>;

  /**
   * Returns `true` if the store has the collection, the collection and record,
   * or the collection, the record and the field specified by the given key.
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
  has(key: string): Promise<boolean>;

  /**
   * Deletes from the store the collection, the record or data field specified by the key,
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
  delete(key: string): Promise<boolean>;

  /**
   * Clears the entire collection or the collection record specified by the key in the store.
   * The key is a string in a format like `collectionName/:recId`,
   * where the `collectionName` is the identifier of a collection in the store,
   * while the `recId` identifies a specific record (entry) in the
   * data collection.
   *
   * @param {string} key
   * @returns
   */
  clear(key: string): Promise<any>;

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
  entries(key: string): Promise<[string, any][]>;

  /**
   * Returns the data collection object with the given name, or `undefined`
   * if the collection does not exist in the store.
   *
   * @param {string} name
   * @returns
   */
  collection(name: string): Promise<TDataCollectionEntry | undefined>;

  /**
   * Returns an array containing the names of all data collections in the store.
   */
  get collections(): string[];

  /**
   * Returns the name and path of the data file.
   */
  get dataFile(): string;
};

/**
 * Defines the database init properties
 * 
 * @export
 * @interface IDatabaseProps
 */
declare interface IDatabaseProps {
  /**
   * The name of the data file
   *
   * @type {string}
   * @memberof IDatabaseProps
   */
  name: string;
  /**
   * The location of the data file
   *
   * @type {string}
   * @memberof IDatabaseProps
   */
  path: string;
  /**
   * Callback for data changes
   *
   * @memberof IDatabaseProps
   */
  onChange?: (data: { type: 'set' | 'update' | 'delete'; key: string; value: any; }) => void;
}
