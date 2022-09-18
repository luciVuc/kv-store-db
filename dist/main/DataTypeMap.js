"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTypeMap = void 0;
const uuid_1 = require("uuid");
/**
 * A Map of key-value fields with a unique identifier property, `uuid`,
 * which, if not specifically provided by client, it will be auto-generated.
 *
 * @export
 * @class DataTypeMap
 * @extends {Map<string, any>}
 */
class DataTypeMap extends Map {
    /**
     * Creates an instance of DataTypeMap.
     *
     * @param {TDataRecord?} [fields] An object containing the key-value fields.
     * @param {string} [uuid] An optional unique identifier for this Data Type instance.
     * @memberof DataTypeMap
     */
    constructor(fields, uuid) {
        super();
        this._uuid = uuid || (0, uuid_1.v4)();
        if (fields) {
            Object.entries(fields).forEach(([key, value]) => {
                this.set(key, value);
            });
        }
    }
    /**
     * Returns the entries as JSON.
     *
     * @returns {TDataRecord}
     * @memberof DataTypeMap
     */
    toJSON() {
        return Object.fromEntries(this);
    }
    /**
     * Returns the UUID.
     */
    get uuid() {
        return this._uuid;
    }
}
exports.DataTypeMap = DataTypeMap;
exports.default = DataTypeMap;
