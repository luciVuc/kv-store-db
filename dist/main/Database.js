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
exports.createDatabase = exports.initDatabase = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const DataStore_1 = require("./DataStore");
/**
 * Create a database instance using the given data file.
 * If the data file does not exist, it will be created.
 *
 * @export
 * @param {IDatabaseProps} { name, path, onChange }
 * @returns
 */
function initDatabase({ name, path, onChange }) {
    return __awaiter(this, void 0, void 0, function* () {
        let store;
        const dataFile = (0, path_1.join)(path, `${name}.json`);
        const loadData = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield (0, promises_1.readFile)(dataFile, 'utf-8');
            return JSON.parse(data);
        });
        try {
            yield (0, promises_1.access)(dataFile, fs_1.constants.R_OK | fs_1.constants.W_OK);
        }
        catch (_a) {
            (0, fs_1.mkdirSync)(path, { recursive: true });
            yield (0, promises_1.writeFile)(dataFile, '{}', 'utf-8');
        }
        return yield (() => __awaiter(this, void 0, void 0, function* () {
            const data = yield loadData();
            store = new DataStore_1.DataStore({ data });
            (0, fs_1.watchFile)(dataFile, () => __awaiter(this, void 0, void 0, function* () {
                store.set('', (yield loadData()));
            }));
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
                set(key, value, merge) {
                    return __awaiter(this, void 0, void 0, function* () {
                        store.set(key, value, merge);
                        yield (0, promises_1.writeFile)(dataFile, JSON.stringify(store.get('')));
                        return store.get(key);
                    });
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
                get(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return store.get(key);
                    });
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
                has(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return store.has(key);
                    });
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
                delete(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const value = store.delete(key);
                        yield (0, promises_1.writeFile)(dataFile, JSON.stringify(store.get('')));
                        return value;
                    });
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
                clear(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const value = store.clear(key);
                        yield (0, promises_1.writeFile)(dataFile, JSON.stringify(store.get('')));
                        return value;
                    });
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
                entries(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return store.entries(key);
                    });
                },
                /**
                 * Returns the data collection object with the given name, or `undefined`
                 * if the collection does not exist in the store.
                 *
                 * @param {string} name
                 * @returns
                 */
                collection(name) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return store.collection(name);
                    });
                },
                /**
                 * Returns an array containing the names of all data collections in the store.
                 */
                get collections() {
                    return store.collections;
                },
                /**
                 * Returns the name and path of the data file.
                 */
                get dataFile() {
                    return dataFile;
                }
            };
        }))();
    });
}
exports.initDatabase = initDatabase;
const dbsMap = new Map();
/**
 * Create a database instance using the given data file.
 * If the data file does not exist, it will be created.
 *
 * @export
 * @param {IDatabaseProps} params
 * @returns
 */
function createDatabase(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, path } = params;
        const dataFile = (0, path_1.join)(path, `${name}.json`);
        if (!dbsMap.has(dataFile)) {
            dbsMap.set(dataFile, yield initDatabase(params));
        }
        return dbsMap.get(dataFile);
    });
}
exports.createDatabase = createDatabase;
;
exports.default = createDatabase;
