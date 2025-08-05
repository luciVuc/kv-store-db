"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DataStore_eventEmitter, _DataStore_collections;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStore = exports.DataCollectionMap = void 0;
const events_1 = require("events");
const DataRecord_1 = require("./DataRecord");
/**
 * A Data Collection Map. It maps data collection names to data collection objects.
 *
 * @export
 * @class DataCollectionMap
 * @extends {Map<string, TDataCollectionEntry>}
 */
class DataCollectionMap extends Map {
}
exports.DataCollectionMap = DataCollectionMap;
;
/**
 * A map of data collection objects, with functionality to perform CRUD
 * operations on them or their content data.
 *
 * @export
 * @class DataStore
 */
class DataStore {
    /**
     * Returns the entire store data as a JSON object.
     *
     * @private
     * @returns
     * @memberof DataStore
     */
    serialize() {
        const data = {};
        this.collections.forEach((tbl) => {
            data[tbl] = {};
            Object.entries(__classPrivateFieldGet(this, _DataStore_collections, "f").get(tbl) || {}).forEach(([key, value]) => {
                data[tbl][key] = value instanceof DataRecord_1.DataRecord ? value.toJSON() : value;
            });
        });
        return data;
    }
    /**
     * Deserializes the data given as JSON object, and uses it
     * to initialize or update the internal `collections` map.
     *
     * @private
     * @param {TDataStoreContent} [data] Data to deserialize into the store
     * @returns {this} The DataStore instance for chaining
     * @memberof DataStore
     */
    deserialize(data) {
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
    constructor({ data }) {
        _DataStore_eventEmitter.set(this, new events_1.EventEmitter());
        _DataStore_collections.set(this, new DataCollectionMap());
        this.deserialize(data);
    }
    /**
     * Adds the 'onChange' `listener` to the listeners array.
     * No checks are made to see if the `listener` has already been added.
     * @param onChange change event listener
     */
    addChangeListener(onChange) {
        if (!this.changeListeners.includes(onChange)) {
            __classPrivateFieldGet(this, _DataStore_eventEmitter, "f").addListener('change', onChange);
        }
        return this;
    }
    /**
     * Removes the specified 'change' `listener` from the listener array.
     * @param onChange
     */
    removeChangeListener(onChange) {
        __classPrivateFieldGet(this, _DataStore_eventEmitter, "f").removeListener('change', onChange);
        return this;
    }
    /**
     * Synchronously calls all registered 'change' listeners, in the order they were registered,
     * passing the supplied arguments to each, and returns `true` if there were any 'change' event
     * listeners, or `false` otherwise.
     * @param data
     */
    emitChange(data) {
        __classPrivateFieldGet(this, _DataStore_eventEmitter, "f").emit('change', data);
    }
    /**
     * Returns an array containing all 'change' listeners.
     * @readonly
     * @memberof DataStore
     */
    get changeListeners() {
        return __classPrivateFieldGet(this, _DataStore_eventEmitter, "f").listeners('change');
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
    set(key, value, merge) {
        var _a, _b, _c, _d, _e;
        const keys = key.split('/');
        const [collectionName, entryId, typeField] = [
            (_a = keys[0]) === null || _a === void 0 ? void 0 : _a.trim(),
            (_b = keys[1]) === null || _b === void 0 ? void 0 : _b.trim(),
            (_d = (_c = keys[2]) === null || _c === void 0 ? void 0 : _c.replace('/', '_')) === null || _d === void 0 ? void 0 : _d.trim()
        ];
        if (typeField && entryId && collectionName) {
            // set the field
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            const entry = collection[entryId] || new DataRecord_1.DataRecord({}, entryId);
            entry.set(typeField, value);
            collection[entryId] = entry;
            __classPrivateFieldGet(this, _DataStore_collections, "f").set(collectionName, collection);
            this.emitChange({ type: 'set', key, value: this.get(key) });
        }
        else if (entryId && collectionName && value instanceof Object) {
            // set the type by id
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            const entry = collection[entryId] && merge ? new DataRecord_1.DataRecord(Object.assign(Object.assign({}, (_e = collection[entryId]) === null || _e === void 0 ? void 0 : _e.toJSON()), value), entryId) : new DataRecord_1.DataRecord(Object.assign({}, value), entryId);
            collection[entryId] = entry;
            __classPrivateFieldGet(this, _DataStore_collections, "f").set(collectionName, collection);
            this.emitChange({ type: 'set', key, value: this.get(key) });
        }
        else if (collectionName && value instanceof Object) {
            // set the collection
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            const entry = new DataRecord_1.DataRecord(Object.assign({}, value), (value === null || value === void 0 ? void 0 : value.id) || (value === null || value === void 0 ? void 0 : value.uuid));
            collection[entry.uuid] = entry;
            __classPrivateFieldGet(this, _DataStore_collections, "f").set(collectionName, collection);
            this.emitChange({ type: 'set', key, value: this.get(key) });
        }
        else if (value instanceof Object) {
            this.deserialize(value);
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
    get(key) {
        var _a, _b, _c, _d, _e, _f;
        const keys = key.split('/');
        const [collectionName, entryId, typeField] = [
            (_a = keys[0]) === null || _a === void 0 ? void 0 : _a.trim(),
            (_b = keys[1]) === null || _b === void 0 ? void 0 : _b.trim(),
            (_d = (_c = keys[2]) === null || _c === void 0 ? void 0 : _c.replace('/', '_')) === null || _d === void 0 ? void 0 : _d.trim()
        ];
        if (!collectionName.length || collectionName === '*') {
            return this.serialize();
        }
        else if (typeField && entryId && collectionName) {
            // get the field
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            return (_e = collection === null || collection === void 0 ? void 0 : collection[entryId]) === null || _e === void 0 ? void 0 : _e.get(typeField);
        }
        else if (entryId && collectionName) {
            // get the type by id
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            return (_f = collection === null || collection === void 0 ? void 0 : collection[entryId]) === null || _f === void 0 ? void 0 : _f.toJSON();
        }
        else if (collectionName) {
            // get the collection
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            const collectionData = {};
            Object.entries(collection).forEach(([key, value]) => {
                collectionData[key] = value instanceof DataRecord_1.DataRecord ? value.toJSON() : value;
            });
            return collectionData;
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
    has(key) {
        var _a, _b, _c, _d, _e;
        const keys = key.split('/');
        const [collectionName, entryId, typeField] = [
            (_a = keys[0]) === null || _a === void 0 ? void 0 : _a.trim(),
            (_b = keys[1]) === null || _b === void 0 ? void 0 : _b.trim(),
            (_d = (_c = keys[2]) === null || _c === void 0 ? void 0 : _c.replace('/', '_')) === null || _d === void 0 ? void 0 : _d.trim()
        ];
        if (typeField && entryId && collectionName) {
            // get the field
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            return !!((_e = collection === null || collection === void 0 ? void 0 : collection[entryId]) === null || _e === void 0 ? void 0 : _e.has(typeField));
        }
        else if (entryId && collectionName) {
            // get the type by id
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            return !!(collection === null || collection === void 0 ? void 0 : collection[entryId]);
        }
        else if (collectionName) {
            // get the collection
            return __classPrivateFieldGet(this, _DataStore_collections, "f").has(collectionName);
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
    delete(key) {
        var _a, _b, _c, _d, _e;
        const keys = key.split('/');
        const [collectionName, entryId, typeField] = [
            (_a = keys[0]) === null || _a === void 0 ? void 0 : _a.trim(),
            (_b = keys[1]) === null || _b === void 0 ? void 0 : _b.trim(),
            (_d = (_c = keys[2]) === null || _c === void 0 ? void 0 : _c.replace('/', '_')) === null || _d === void 0 ? void 0 : _d.trim()
        ];
        let ret = false;
        if (typeField && entryId && collectionName) {
            // delete the field
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName);
            ret = !!((_e = collection === null || collection === void 0 ? void 0 : collection[entryId]) === null || _e === void 0 ? void 0 : _e.delete(typeField));
        }
        else if (entryId && collectionName) {
            // delete the type by id
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName);
            ret = !!(collection === null || collection === void 0 ? true : delete collection[entryId]);
        }
        else if (collectionName) {
            // delete the collection
            ret = __classPrivateFieldGet(this, _DataStore_collections, "f").delete(collectionName);
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
    clear(key) {
        var _a, _b, _c;
        const keys = key.split('/');
        const [collectionName, entryId] = [
            (_a = keys[0]) === null || _a === void 0 ? void 0 : _a.trim(),
            (_b = keys[1]) === null || _b === void 0 ? void 0 : _b.trim()
        ];
        if (!collectionName.length || collectionName === '*') {
            __classPrivateFieldGet(this, _DataStore_collections, "f").clear();
            this.emitChange({ type: 'delete', key, value: this.get(key) });
        }
        else if (entryId && collectionName) {
            // clear the type by id
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName);
            (_c = collection === null || collection === void 0 ? void 0 : collection[entryId]) === null || _c === void 0 ? void 0 : _c.clear();
            this.emitChange({ type: 'delete', key, value: this.get(key) });
        }
        else if (collectionName) {
            // clear the collection
            __classPrivateFieldGet(this, _DataStore_collections, "f").set(collectionName, {});
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
    entries(key) {
        var _a, _b;
        const keys = key.split('/');
        const [collectionName, entryId] = [
            (_a = keys[0]) === null || _a === void 0 ? void 0 : _a.trim(),
            (_b = keys[1]) === null || _b === void 0 ? void 0 : _b.trim()
        ];
        if (entryId && collectionName) {
            // entries the type by id
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName);
            return (collection === null || collection === void 0 ? void 0 : collection[entryId]) && Object.entries(collection === null || collection === void 0 ? void 0 : collection[entryId].toJSON());
        }
        else if (collectionName) {
            // entries the collection
            const collection = __classPrivateFieldGet(this, _DataStore_collections, "f").get(collectionName) || {};
            const collectionData = {};
            Object.entries(collection).forEach(([key, value]) => {
                collectionData[key] = value instanceof DataRecord_1.DataRecord ? value.toJSON() : value;
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
    collection(name) {
        return __classPrivateFieldGet(this, _DataStore_collections, "f").get(name);
    }
    /**
     * Returns an array containing the names of all data collections in the store.
     */
    get collections() {
        const collections = [];
        const itr = __classPrivateFieldGet(this, _DataStore_collections, "f").keys();
        for (let i = 0, value; i < __classPrivateFieldGet(this, _DataStore_collections, "f").size; i++) {
            value = itr.next().value;
            if (typeof value === 'string') {
                collections.push(value);
            }
        }
        return collections;
    }
}
exports.DataStore = DataStore;
_DataStore_eventEmitter = new WeakMap(), _DataStore_collections = new WeakMap();
exports.default = DataStore;
