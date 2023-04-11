"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionInstance = exports.Instance = exports.yes = exports.nil = exports.EOF = void 0;
exports.EOF = Instance(false, "EOF");
exports.nil = Instance(false, "Boolean");
exports.yes = Instance(true, "Boolean");
function Instance(value, type) {
    return {
        type,
        value
    };
}
exports.Instance = Instance;
function FunctionInstance(fun, isMacro = false) {
    return Instance({ fun, isMacro }, "Function");
}
exports.FunctionInstance = FunctionInstance;
