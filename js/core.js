"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const printer_1 = __importDefault(require("./printer"));
const reader_1 = __importDefault(require("./reader"));
const fs_1 = __importDefault(require("fs"));
const types_1 = require("./types");
const eq = (a, b) => {
    if (a.type !== b.type)
        return types_1.nil;
    if (a.type === "List") {
        const aList = a.value;
        const bList = b.value;
        if (aList.length !== bList.length)
            return types_1.nil;
        for (let i = 0; i < aList.length; i++) {
            if (!eq(aList[i], bList[i]).value)
                return types_1.nil;
        }
        return types_1.yes;
    }
    if (a.value !== b.value)
        return types_1.nil;
    return types_1.yes;
};
const core = {
    'typeof': (0, types_1.EnvFunctionInstance)((exp) => (0, types_1.Instance)(':' + exp.type.toUpperCase(), "Keyword")),
    '+': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value + b.value, "Number")),
    '-': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value - b.value, "Number")),
    '*': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value * b.value, "Number")),
    '/': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value / b.value, "Number")),
    '%': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value % b.value, "Number")),
    'prn-str': (0, types_1.EnvFunctionInstance)((...args) => {
        return (0, types_1.Instance)(args.map(arg => printer_1.default.pr_str(arg, true)).join(' '), "String");
    }),
    str: (0, types_1.EnvFunctionInstance)((...args) => {
        return (0, types_1.Instance)(args.map(arg => printer_1.default.pr_str(arg, false)).join(''), "String");
    }),
    prn: (0, types_1.EnvFunctionInstance)((...args) => {
        console.log(args.map(arg => printer_1.default.pr_str(arg, true)).join(' '));
        return types_1.nil;
    }),
    println: (0, types_1.EnvFunctionInstance)((...args) => {
        console.log(args.map(arg => printer_1.default.pr_str(arg, false)).join(' '));
        return types_1.nil;
    }),
    list: (0, types_1.EnvFunctionInstance)((...args) => (0, types_1.Instance)(args, "List")),
    cons: (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)([...a.value, ...b.value], "List")),
    concat: (0, types_1.EnvFunctionInstance)((...lists) => {
        const newList = [];
        for (let list of lists) {
            for (let el of list.value) {
                newList.push(el);
            }
        }
        return (0, types_1.Instance)(newList, "List");
    }),
    count: (0, types_1.EnvFunctionInstance)((list) => (0, types_1.Instance)(list.value.length, "Number")),
    'list?': (0, types_1.EnvFunctionInstance)((exp) => (0, types_1.Instance)(exp.type === "List", "Boolean")),
    'empty?': (0, types_1.EnvFunctionInstance)((list) => (0, types_1.Instance)(list.value.length === 0, "Boolean")),
    '=': (0, types_1.EnvFunctionInstance)(eq),
    '>': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value > b.value, "Boolean")),
    '<': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value < b.value, "Boolean")),
    '>=': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value >= b.value, "Boolean")),
    '<=': (0, types_1.EnvFunctionInstance)((a, b) => (0, types_1.Instance)(a.value <= b.value, "Boolean")),
    'read-str': (0, types_1.EnvFunctionInstance)((str) => reader_1.default.read_str(str.value)),
    slurp: (0, types_1.EnvFunctionInstance)((str) => (0, types_1.Instance)(fs_1.default.readFileSync(str.value, 'utf8'), "String")),
};
exports.default = core;
