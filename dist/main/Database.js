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
                set(key, value, merge) {
                    return __awaiter(this, void 0, void 0, function* () {
                        store.set(key, value, merge);
                        yield (0, promises_1.writeFile)(dataFile, JSON.stringify(store.get('')));
                        return store.get(key);
                    });
                },
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
                get(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return store.get(key);
                    });
                },
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
                has(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return store.has(key);
                    });
                },
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
                delete(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const value = store.delete(key);
                        yield (0, promises_1.writeFile)(dataFile, JSON.stringify(store.get('')));
                        return value;
                    });
                },
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
                clear(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const value = store.clear(key);
                        yield (0, promises_1.writeFile)(dataFile, JSON.stringify(store.get('')));
                        return value;
                    });
                },
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
                entries(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return store.entries(key);
                    });
                },
                /**
                 * Returns the data table object with the given name, or `undefined`
                 * if the table does not exist in the store.
                 *
                 * @param {string} name
                 * @returns
                 */
                table(name) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return store.table(name);
                    });
                },
                /**
                 * Returns an array containing the names of all data tables in the store.
                 */
                get tables() {
                    return store.tables;
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
