"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvFunctionInstance = exports.Instance = exports.yes = exports.nil = exports.EOF = void 0;
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
function EnvFunctionInstance(f) {
    return Instance(f, "Function");
}
exports.EnvFunctionInstance = EnvFunctionInstance;
