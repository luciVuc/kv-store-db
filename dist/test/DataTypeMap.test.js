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
const main_1 = require("../main");
const sample_json_1 = require("./data/sample.json");
describe('DataTypeMap', () => {
    it('initializes with default args', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap();
        expect(type.toJSON()).toEqual({});
        expect(type.uuid.length).toBeGreaterThan(0);
    }));
    it('initializes with no data args but given UUID', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap({}, '12345');
        expect(type.toJSON()).toEqual({});
        expect(type.uuid).toEqual('12345');
    }));
    it('initializes with data args and default UUID', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap(sample_json_1.users.user1);
        expect(type.toJSON()).toEqual(sample_json_1.users.user1);
        expect(type.uuid.length).toBeGreaterThan(0);
    }));
    it('initializes with data args and default UUID', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap(sample_json_1.users.user1, sample_json_1.users.user1.id);
        expect(type.get('id')).toEqual('user1');
        expect(type.get('fName')).toEqual('Luke');
        expect(type.get('lName')).toEqual('Skywalker');
        expect(type.get('age')).toEqual(30);
        expect(type.toJSON()).toEqual(sample_json_1.users.user1);
        expect(type.uuid).toEqual(type.get('id'));
    }));
    it('can change initial values of data fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap(sample_json_1.users.user1, sample_json_1.users.user1.id);
        expect(type.get('id')).toEqual('user1');
        expect(type.get('fName')).toEqual('Luke');
        expect(type.get('lName')).toEqual('Skywalker');
        expect(type.get('age')).toEqual(30);
        expect(type.toJSON()).toEqual(sample_json_1.users.user1);
        expect(type.uuid).toEqual(type.get('id'));
        type.set('fName', 'Donald');
        type.set('lName', 'Trump');
        type.set('age', 74);
        expect(type.get('id')).toEqual('user1');
        expect(type.get('fName')).toEqual('Donald');
        expect(type.get('lName')).toEqual('Trump');
        expect(type.get('age')).toEqual(74);
    }));
    it('can add a new data fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap(sample_json_1.users.user1, sample_json_1.users.user1.id);
        expect(type.toJSON()).toEqual(sample_json_1.users.user1);
        expect(type.uuid).toEqual(type.get('id'));
        type.set('tmp', 123);
        expect(type.toJSON()).toEqual(Object.assign(Object.assign({}, sample_json_1.users.user1), { tmp: 123 }));
    }));
    it('can remove a data fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap(sample_json_1.users.user1, sample_json_1.users.user1.id);
        expect(type.toJSON()).toEqual(sample_json_1.users.user1);
        expect(type.uuid).toEqual(type.get('id'));
        type.delete('age');
        expect(type.toJSON()).toEqual({
            id: sample_json_1.users.user1.id,
            fName: sample_json_1.users.user1.fName,
            lName: sample_json_1.users.user1.lName
        });
    }));
    it('can clear the data fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap(sample_json_1.users.user1, sample_json_1.users.user1.id);
        expect(type.toJSON()).toEqual(sample_json_1.users.user1);
        expect(type.uuid).toEqual(type.get('id'));
        type.clear();
        expect(type.toJSON()).toEqual({});
        expect(type.uuid).toEqual(sample_json_1.users.user1.id);
    }));
    it('supports other Map functionality', () => __awaiter(void 0, void 0, void 0, function* () {
        const type = new main_1.DataTypeMap(sample_json_1.users.user1, sample_json_1.users.user1.id);
        expect(type.toJSON()).toEqual(sample_json_1.users.user1);
        expect(type.uuid).toEqual(type.get('id'));
        expect(type.size).toEqual(4);
        const keysItr = type.keys();
        expect(keysItr.next().value).toEqual('id');
        expect(keysItr.next().value).toEqual('fName');
        expect(keysItr.next().value).toEqual('lName');
        expect(keysItr.next().value).toEqual('age');
        const valuesItr = type.values();
        expect(valuesItr.next().value).toEqual('user1');
        expect(valuesItr.next().value).toEqual('Luke');
        expect(valuesItr.next().value).toEqual('Skywalker');
        expect(valuesItr.next().value).toEqual(30);
        const entries = type.entries();
        expect(entries.next().value).toEqual(['id', 'user1']);
        expect(entries.next().value).toEqual(['fName', 'Luke']);
        expect(entries.next().value).toEqual(['lName', 'Skywalker']);
        expect(entries.next().value).toEqual(['age', 30]);
    }));
});
