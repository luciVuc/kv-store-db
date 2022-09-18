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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const main_1 = require("../main");
const sample_json_1 = __importDefault(require("./data/sample.json"));
const path_1 = require("path");
describe('Database', () => {
    beforeAll(() => {
        (0, node_fs_1.copyFile)((0, path_1.join)(__dirname, 'data/sample.json'), (0, path_1.join)(__dirname, 'data/test.json'), (err) => {
            if (err) {
                throw err;
            }
        });
    });
    it('initializes with no data file', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'none',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(db).not.toBeUndefined();
        expect(db.tables.length).toBe(0);
        yield (0, promises_1.rm)((0, path_1.join)(__dirname, 'data/none.json'));
    }));
    it('initializes with data file', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(db).not.toBeUndefined();
        expect(db.tables).toMatchObject(['users', 'posts']);
    }));
    it('gets the tables', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(db.tables).toEqual(['users', 'posts']);
        expect(yield db.table('users')).toMatchObject({
            'user1': new main_1.DataTypeMap({
                "id": "user1",
                "fName": "John",
                "lName": "Doe",
                "age": 30
            }, 'user1')
        });
        expect(yield db.table('users')).toMatchObject({
            'user2': new main_1.DataTypeMap({
                "id": "user2",
                "fName": "Gigi",
                "lName": "Duru",
                "age": 33,
                "peers": [
                    "user1"
                ]
            }, 'user2')
        });
        expect(yield db.table('posts')).toMatchObject({
            "post1": new main_1.DataTypeMap({
                "id": "post1",
                "userId": "user1",
                "content": "Hello"
            }, 'post1')
        });
        expect(yield db.table('posts')).toMatchObject({
            "post2": new main_1.DataTypeMap({
                "id": "post2",
                "userId": "user2",
                "content": "Howdy!",
                "reply": "post1"
            }, 'post2')
        });
    }));
    it('gets values by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users/user1/id')).toEqual('user1');
        expect(yield db.get('users/user1/fName')).toEqual('John');
        expect(yield db.get('users/user1/lName')).toEqual('Doe');
        expect(yield db.get('users/user1/age')).toEqual(30);
        expect(yield db.get('users/user1/fullName')).toBeUndefined();
        expect(yield db.get('users/user2/id')).toEqual('user2');
        expect(yield db.get('users/user2/fName')).toEqual('Gigi');
        expect(yield db.get('users/user2/lName')).toEqual('Duru');
        expect(yield db.get('users/user2/age')).toEqual(33);
    }));
    it('gets records by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users/user1')).toMatchObject({
            "id": "user1",
            "fName": "John",
            "lName": "Doe",
            "age": 30
        });
        expect(yield db.get('users/user2')).toMatchObject({
            "id": "user2",
            "fName": "Gigi",
            "lName": "Duru",
            "age": 33,
            "peers": [
                "user1"
            ]
        });
        expect(yield db.get('posts/post1')).toMatchObject({
            "id": "post1",
            "userId": "user1",
            "content": "Hello"
        });
        expect(yield db.get('posts/post2')).toMatchObject({
            "id": "post2",
            "userId": "user2",
            "content": "Howdy!",
            "reply": "post1"
        });
        expect(yield db.get('posts/post3')).toBeUndefined();
    }));
    it('gets tables by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users')).toMatchObject({
            'user1': {
                "id": "user1",
                "fName": "John",
                "lName": "Doe",
                "age": 30
            },
            'user2': {
                "id": "user2",
                "fName": "Gigi",
                "lName": "Duru",
                "age": 33,
                "peers": [
                    "user1"
                ]
            }
        });
        expect(yield db.get('posts')).toMatchObject({
            'post1': {
                "id": "post1",
                "userId": "user1",
                "content": "Hello"
            },
            'post2': {
                "id": "post2",
                "userId": "user2",
                "content": "Howdy!",
                "reply": "post1"
            }
        });
        expect(yield db.get('likes')).toMatchObject({});
    }));
    it('gets all data by empty key', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('')).toMatchObject(Object.assign({}, sample_json_1.default));
        expect(yield db.get('*')).toMatchObject(Object.assign({}, sample_json_1.default));
    }));
    it('sets values by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users/user1/id')).toEqual('user1');
        expect(yield db.get('users/user1/fName')).toEqual('John');
        expect(yield db.get('users/user1/lName')).toEqual('Doe');
        expect(yield db.get('users/user1/age')).toEqual(30);
        yield db.set('users/user1/id', 'USER1');
        yield db.set('users/user1/age', 31);
        yield db.set('users/USER1/age', 32);
        expect(yield db.get('users/user1/id')).toEqual('USER1');
        expect(yield db.get('users/user1/fName')).toEqual('John');
        expect(yield db.get('users/user1/lName')).toEqual('Doe');
        expect(yield db.get('users/user1/age')).toEqual(31);
        expect(yield db.get('users/USER1/id')).toBeUndefined();
        expect(yield db.get('users/USER1/fName')).toBeUndefined();
        expect(yield db.get('users/USER1/lName')).toBeUndefined();
        expect(yield db.get('users/USER1/age')).toEqual(32);
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('sets records by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users/user1')).toMatchObject({
            "id": "user1",
            "fName": "John",
            "lName": "Doe",
            "age": 30
        });
        expect(yield db.get('users/user2')).toMatchObject({
            "id": "user2",
            "fName": "Gigi",
            "lName": "Duru",
            "age": 33,
            "peers": [
                "user1"
            ]
        });
        expect(yield db.get('posts/post1')).toMatchObject({
            "id": "post1",
            "userId": "user1",
            "content": "Hello"
        });
        expect(yield db.get('posts/post2')).toMatchObject({
            "id": "post2",
            "userId": "user2",
            "content": "Howdy!",
            "reply": "post1"
        });
        expect(yield db.get('posts/post3')).toBeUndefined();
        expect(yield db.get('users/USER1')).toBeUndefined();
        yield db.set('posts/post3', {
            "id": "post3",
            "userId": "user2",
            "content": "Hey yall!",
            "reply": "post1"
        });
        yield db.set('users/USER1', {
            "id": "USER1",
            "fName": "Forest",
            "lName": "Gump",
            "age": 35,
            "peers": []
        });
        expect(yield db.get('users/USER1')).toMatchObject({
            "id": "USER1",
            "fName": "Forest",
            "lName": "Gump",
            "age": 35,
            "peers": []
        });
        expect(yield db.get('posts/post3')).toMatchObject({
            "id": "post3",
            "userId": "user2",
            "content": "Hey yall!",
            "reply": "post1"
        });
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('sets records by keys - no merge', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users/USER1')).toBeUndefined();
        yield db.set('users/USER1', {
            "id": "USER1",
            "fName": "Forest",
            "lName": "Gump",
            "age": 35
        });
        expect(yield db.get('users/USER1')).toMatchObject({
            "id": "USER1",
            "fName": "Forest",
            "lName": "Gump",
            "age": 35
        });
        yield db.set('users/USER1', {
            "id": "USER1",
            "fName": "Forest",
            "lName": "Gump",
            "peers": []
        });
        expect(yield db.get('users/USER1')).toMatchObject({
            "id": "USER1",
            "fName": "Forest",
            "lName": "Gump",
            "peers": []
        });
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('sets records by keys - with merge', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users/USER1')).toBeUndefined();
        yield db.set('users/USER1', {
            "id": "USER1",
            "fName": "Forest",
            "lName": "Gump",
            "age": 35
        }, true);
        expect(yield db.get('users/USER1')).toMatchObject({
            "id": "USER1",
            "fName": "Forest",
            "lName": "Gump",
            "age": 35
        });
        yield db.set('users/USER1', {
            "id": "USER1",
            "fName": "Run Forest",
            "lName": "Gump",
            "peers": []
        }, true);
        expect(yield db.get('users/USER1')).toMatchObject({
            "id": "USER1",
            "fName": "Run Forest",
            "lName": "Gump",
            "age": 35,
            "peers": []
        });
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('sets tables by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users')).toMatchObject({
            'user1': {
                "id": "user1",
                "fName": "John",
                "lName": "Doe",
                "age": 30
            },
            'user2': {
                "id": "user2",
                "fName": "Gigi",
                "lName": "Duru",
                "age": 33,
                "peers": [
                    "user1"
                ]
            }
        });
        expect(yield db.get('posts')).toMatchObject({
            'post1': {
                "id": "post1",
                "userId": "user1",
                "content": "Hello"
            },
            'post2': {
                "id": "post2",
                "userId": "user2",
                "content": "Howdy!",
                "reply": "post1"
            }
        });
        expect(yield db.get('likes')).toMatchObject({});
        expect(yield db.tables).toMatchObject(['users', 'posts']);
        yield db.set('likes/like1', {
            'id': 'like1',
            'post': 'post1'
        });
        expect(yield db.get('users')).toMatchObject({
            'user1': {
                "id": "user1",
                "fName": "John",
                "lName": "Doe",
                "age": 30
            },
            'user2': {
                "id": "user2",
                "fName": "Gigi",
                "lName": "Duru",
                "age": 33,
                "peers": [
                    "user1"
                ]
            }
        });
        expect(yield db.get('posts')).toMatchObject({
            'post1': {
                "id": "post1",
                "userId": "user1",
                "content": "Hello"
            },
            'post2': {
                "id": "post2",
                "userId": "user2",
                "content": "Howdy!",
                "reply": "post1"
            }
        });
        expect(yield db.get('likes')).toMatchObject({
            'like1': {
                'id': 'like1',
                'post': 'post1'
            }
        });
        expect(yield db.tables).toMatchObject(['users', 'posts', 'likes']);
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('has values by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.has('users/user1/id')).toBe(true);
        expect(yield db.has('users/user1/fName')).toBe(true);
        expect(yield db.has('users/user1/lName')).toBe(true);
        expect(yield db.has('users/user1/age')).toBe(true);
        expect(yield db.has('users/user1/fullName')).toBe(false);
    }));
    it('has records by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.has('users/user1')).toBe(true);
        expect(yield db.has('users/user2')).toBe(true);
        expect(yield db.has('users/user3')).toBe(false);
        expect(yield db.has('posts/post1')).toBe(true);
        expect(yield db.has('posts/post3')).toBe(false);
    }));
    it('has tables by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.has('users')).toBe(true);
        expect(yield db.has('posts')).toBe(true);
        expect(yield db.has('likes')).toBe(false);
    }));
    it('deletes values by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users/user1/id')).toEqual('user1');
        expect(yield db.get('users/user1/fName')).toEqual('John');
        expect(yield db.get('users/user1/lName')).toEqual('Doe');
        expect(yield db.get('users/user1/age')).toEqual(30);
        expect(yield db.get('users/user1/fullName')).toBeUndefined();
        expect(yield db.has('users/user1/id')).toBe(true);
        expect(yield db.has('users/user1/fName')).toBe(true);
        expect(yield db.has('users/user1/lName')).toBe(true);
        expect(yield db.has('users/user1/age')).toBe(true);
        expect(yield db.has('users/user1/fullName')).toBe(false);
        yield db.delete('users/user1/age');
        expect(yield db.get('users/user1/id')).toEqual('user1');
        expect(yield db.get('users/user1/fName')).toEqual('John');
        expect(yield db.get('users/user1/lName')).toEqual('Doe');
        expect(yield db.get('users/user1/age')).toBeUndefined();
        expect(yield db.get('users/user1/fullName')).toBeUndefined();
        expect(yield db.has('users/user1/id')).toBe(true);
        expect(yield db.has('users/user1/fName')).toBe(true);
        expect(yield db.has('users/user1/lName')).toBe(true);
        expect(yield db.has('users/user1/age')).toBe(false);
        expect(yield db.has('users/user1/fullName')).toBe(false);
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('deletes records by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.has('users/user1')).toBe(true);
        expect(yield db.has('users/user2')).toBe(true);
        expect(yield db.has('users/user3')).toBe(false);
        expect(yield db.has('posts/post1')).toBe(true);
        expect(yield db.has('posts/post3')).toBe(false);
        yield db.delete('users/user1');
        yield db.delete('users/user3');
        expect(yield db.has('users/user1')).toBe(false);
        expect(yield db.has('users/user2')).toBe(true);
        expect(yield db.has('users/user3')).toBe(false);
        expect(yield db.has('posts/post1')).toBe(true);
        expect(yield db.has('posts/post3')).toBe(false);
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('deletes tables by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.has('users')).toBe(true);
        expect(yield db.has('posts')).toBe(true);
        expect(yield db.has('likes')).toBe(false);
        yield db.delete('users');
        yield db.delete('likes');
        expect(yield db.has('users')).toBe(false);
        expect(yield db.has('posts')).toBe(true);
        expect(yield db.has('likes')).toBe(false);
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('clears all db data', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.has('users/user1')).toBe(true);
        expect(yield db.has('users/user2')).toBe(true);
        expect(yield db.has('likes/likes1')).toBe(false);
        yield db.clear('');
        expect(yield db.has('users/user1')).toBe(false);
        expect(yield db.has('users/user2')).toBe(false);
        expect(yield db.has('likes/like1')).toBe(false);
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('clears records by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users/user1')).toMatchObject({
            "id": "user1",
            "fName": "John",
            "lName": "Doe",
            "age": 30
        });
        expect(yield db.get('users/user2')).toMatchObject({
            "id": "user2",
            "fName": "Gigi",
            "lName": "Duru",
            "age": 33,
            "peers": [
                "user1"
            ]
        });
        expect(yield db.has('likes/likes1')).toBe(false);
        yield db.clear('users/user1');
        yield db.clear('likes/like1');
        expect(yield db.get('users/user1')).toMatchObject({});
        expect(yield db.get('users/user2')).toMatchObject({
            "id": "user2",
            "fName": "Gigi",
            "lName": "Duru",
            "age": 33,
            "peers": [
                "user1"
            ]
        });
        expect(yield db.has('likes/like1')).toBe(false);
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('clears tables by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.get('users')).toMatchObject({
            'user1': {
                "id": "user1",
                "fName": "John",
                "lName": "Doe",
                "age": 30
            },
            'user2': {
                "id": "user2",
                "fName": "Gigi",
                "lName": "Duru",
                "age": 33,
                "peers": [
                    "user1"
                ]
            }
        });
        expect(yield db.get('posts')).toMatchObject({
            'post1': {
                "id": "post1",
                "userId": "user1",
                "content": "Hello"
            },
            'post2': {
                "id": "post2",
                "userId": "user2",
                "content": "Howdy!",
                "reply": "post1"
            }
        });
        expect(yield db.get('likes')).toMatchObject({});
        yield db.clear('users');
        yield db.clear('likes');
        expect(yield db.get('users')).toMatchObject({});
        expect(yield db.get('posts')).toMatchObject({
            'post1': {
                "id": "post1",
                "userId": "user1",
                "content": "Hello"
            },
            'post2': {
                "id": "post2",
                "userId": "user2",
                "content": "Howdy!",
                "reply": "post1"
            }
        });
        expect(yield db.get('likes')).toMatchObject({});
        yield db.clear('');
        yield db.set('', sample_json_1.default);
    }));
    it('gets record entries by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.entries('users/user1')).toMatchObject([
            ["id", "user1"],
            ["fName", "John"],
            ["lName", "Doe"],
            ["age", 30]
        ]);
        expect(yield db.entries('likes/likes1')).toBeUndefined();
    }));
    it('gets table entries by keys', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, main_1.createDatabase)({
            name: 'test',
            path: (0, path_1.join)(__dirname, 'data')
        });
        expect(yield db.entries('users')).toMatchObject([
            [
                'user1', {
                    "id": "user1",
                    "fName": "John",
                    "lName": "Doe",
                    "age": 30
                }
            ],
            [
                'user2', {
                    "id": "user2",
                    "fName": "Gigi",
                    "lName": "Duru",
                    "age": 33,
                    "peers": [
                        "user1"
                    ]
                }
            ]
        ]);
        expect(yield db.entries('likes')).toMatchObject([]);
    }));
});
