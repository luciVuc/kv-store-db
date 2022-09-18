import { v4 as uuidV4 } from 'uuid';

/**
 * A Map of key-value fields with a unique identifier property, `uuid`,
 * which, if not specifically provided by client, it will be auto-generated.
 *
 * @export
 * @class DataTypeMap
 * @extends {Map<string, any>}
 */
export class DataTypeMap extends Map<string, any> {
  private _uuid: string;

  /**
   * Creates an instance of DataTypeMap.
   *
   * @param {TDataRecord?} [fields] An object containing the key-value fields.
   * @param {string} [uuid] An optional unique identifier for this Data Type instance.
   * @memberof DataTypeMap
   */
  constructor(fields?: TDataRecord, uuid?: string) {
    super();
    this._uuid = uuid || uuidV4();
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
  toJSON(): TDataRecord {
    return Object.fromEntries(this);
  }

  /**
   * Returns the UUID.
   */
  get uuid() {
    return this._uuid;
  }
}
export default DataTypeMap;
