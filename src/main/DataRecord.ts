import { v4 as uuidV4 } from 'uuid';

/**
 * A map of fields (key-value pairs) referenced by a unique identifier (`uuid`)
 * which, if not provided by the client, it will be generated automatically.
 *
 * @export
 * @class DataRecord
 * @extends {Map<string, any>}
 */
export class DataRecord extends Map<string, any> {
  #uuid: string;

  /**
   * Creates an instance of DataRecord.
   *
   * @param {TDataRecord?} [fields] An object containing the key-value fields.
   * @param {string} [uuid] An optional unique identifier for this Data Type instance.
   * @memberof DataRecord
   */
  constructor(fields?: TDataRecord, uuid?: string) {
    super();
    this.#uuid = uuid || uuidV4();
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
  toJSON(): TDataRecord {
    return Object.fromEntries(this);
  }

  /**
   * Returns the UUID.
   */
  get uuid() {
    return this.#uuid;
  }
}
export default DataRecord;
