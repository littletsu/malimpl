"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class Env {
    constructor(outer, binds, exprs) {
        var _a;
        this.outer = outer;
        this.data = {};
        if (!binds || !exprs)
            return;
        for (let i = 0; i < binds.length; i++) {
            const bind = binds[i];
            const key = bind.value;
            if (key[key.length - 1] === "&") {
                this.data[key.slice(0, -1)] = (0, types_1.Instance)(exprs.slice(i), "List");
                break;
            }
            this.data[key] = (_a = exprs[i]) !== null && _a !== void 0 ? _a : types_1.nil;
        }
    }
    set(symbol, value) {
        this.data[symbol] = value;
    }
    find(symbol) {
        var _a;
        if (this.data[symbol])
            return this;
        return (_a = this.outer) === null || _a === void 0 ? void 0 : _a.find(symbol);
    }
    get(symbol) {
        const env = this.find(symbol);
        const data = env === null || env === void 0 ? void 0 : env.data[symbol];
        if (data)
            return data;
        throw new ReferenceError(`Unbound symbol ${symbol}`);
    }
}
exports.default = Env;
