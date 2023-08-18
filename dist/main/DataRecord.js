"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DataRecord_uuid;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRecord = void 0;
const uuid_1 = require("uuid");
/**
 * A map of fields (key-value pairs) referenced by a unique identifier (`uuid`)
 * which, if not provided by the client, it will be generated automatically.
 *
 * @export
 * @class DataRecord
 * @extends {Map<string, any>}
 */
class DataRecord extends Map {
    /**
     * Creates an instance of DataRecord.
     *
     * @param {TDataRecord?} [fields] An object containing the key-value fields.
     * @param {string} [uuid] An optional unique identifier for this Data Type instance.
     * @memberof DataRecord
     */
    constructor(fields, uuid) {
        super();
        _DataRecord_uuid.set(this, void 0);
        __classPrivateFieldSet(this, _DataRecord_uuid, uuid || (0, uuid_1.v4)(), "f");
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
     * @memberof DataRecord
     */
    toJSON() {
        return Object.fromEntries(this);
    }
    /**
     * Returns the UUID.
     */
    get uuid() {
        return __classPrivateFieldGet(this, _DataRecord_uuid, "f");
    }
}
exports.DataRecord = DataRecord;
_DataRecord_uuid = new WeakMap();
exports.default = DataRecord;
