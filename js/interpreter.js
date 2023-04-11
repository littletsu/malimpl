"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const printer_1 = __importDefault(require("./printer"));
const reader_1 = __importDefault(require("./reader"));
const env_1 = __importDefault(require("./env"));
const types_1 = require("./types");
class Interpreter {
    static read(str) {
        return reader_1.default.read_str(str);
    }
    static eval_ast(ast, env) {
        let value;
        switch (ast.type) {
            case "Symbol":
                value = ast.value;
                let symbol = env.get(value);
                return symbol;
            case "List":
                value = ast.value;
                return (0, types_1.Instance)(value.map(el => this.eval(el, env)), "List");
            case "Vector":
                value = ast.value;
                return (0, types_1.Instance)(value.map(el => this.eval(el, env)), "Vector");
            case "HashMap":
                value = ast.value;
                const evaled = [];
                for (let i = 0; i < value.length; i++) {
                    if (((i + 1) % 2) === 0)
                        evaled.push(this.eval(value[i], env));
                    else
                        evaled.push(value[i]);
                }
                return (0, types_1.Instance)(evaled, "HashMap");
        }
        return ast;
    }
    static getMacroCall(ast, env) {
        if (ast.type !== "List")
            return false;
        const list = ast.value;
        if (list[0].type !== "Symbol")
            return false;
        let symbol;
        try {
            symbol = env.get(list[0].value);
        }
        catch (err) {
            if (err.name === "ReferenceError")
                return false;
            throw err;
        }
        if (symbol.type !== "Function")
            return false;
        const funval = symbol.value;
        if (!funval.isMacro)
            return false;
        return funval.fun;
    }
    static macroexpand(ast, env) {
        let macroast = ast;
        let macrofun = this.getMacroCall(macroast, env);
        while (macrofun) {
            macroast = macrofun(...macroast.value.slice(1));
            macrofun = this.getMacroCall(macroast, env);
        }
        return macroast;
    }
    static eval(ast, env) {
        let evalast = ast;
        if (ast.type === "List") {
            let list = evalast.value;
            if (list.length === 0)
                return ast;
            const expanded = this.macroexpand(ast, env);
            if (expanded.type !== "List")
                return this.eval_ast(expanded, env);
            evalast = expanded;
            list = expanded.value;
            switch (list[0].value) {
                case "def!":
                    if (list.length !== 3)
                        throw new Error("Invalid number of arguments to def!");
                    if (list[1].type !== "Symbol")
                        throw new TypeError("def! key must be a Symbol");
                    const evaled = this.eval(list[2], env);
                    env.set(list[1].value, evaled);
                    return evaled;
                case "defmacro!":
                    if (list.length !== 3)
                        throw new Error("Invalid number of arguments to defmacro!");
                    if (list[1].type !== "Symbol")
                        throw new TypeError("defmacro! key must be a Symbol");
                    const evaledValue = this.eval(list[2], env);
                    if (evaledValue.type !== "Function")
                        throw new TypeError("defmacro! value must be a Function");
                    const macroInstance = (0, types_1.FunctionInstance)(evaledValue.value.fun, true);
                    const evaledMacro = this.eval(macroInstance, env);
                    env.set(list[1].value, evaledMacro);
                    return evaledMacro;
                case "macroexpand":
                    return this.macroexpand((0, types_1.Instance)(list.slice(1), "List"), env);
                case "let*":
                    if (list.length !== 3)
                        throw new Error("Invalid number of arguments to let*");
                    if (list[1].type !== "List")
                        throw new TypeError("let* bindings must be a list of key-value pairs");
                    const bindings = list[1].value;
                    if ((bindings.length % 2) !== 0)
                        throw new Error("let* bindings list has a key without a value");
                    const letEnv = new env_1.default(env);
                    for (let i = 0; i < bindings.length; i += 2) {
                        if (bindings[i].type !== "Symbol")
                            throw new TypeError("let* binding key must be a Symbol");
                        const key = bindings[i].value;
                        const value = this.eval(bindings[i + 1], letEnv);
                        letEnv.set(key, value);
                    }
                    return this.eval(list[2], letEnv);
                case "fn*":
                    if (list.length !== 3)
                        throw new Error("Invalid number of arguments to fn*");
                    if (list[1].type !== "List")
                        throw new TypeError("fn* list of arguments must be a list of Symbols");
                    for (let element of list[1].value) {
                        if (element.type !== "Symbol")
                            throw new TypeError("fn* list of arguments must be a list of Symbols");
                    }
                    const binds = list[1].value;
                    const fnAst = list[2];
                    return (0, types_1.FunctionInstance)((...args) => {
                        const fnEnv = new env_1.default(env, binds, args);
                        return this.eval(fnAst, fnEnv);
                    });
                case "do":
                    const doList = list.slice(1);
                    const evaluated = doList.map(el => this.eval(el, env));
                    return evaluated[evaluated.length - 1];
                case "if":
                    const condition = this.eval(list[1], env).value != false;
                    const result = list[3 - +condition];
                    if (result === undefined)
                        return types_1.nil;
                    return this.eval(result, env);
                case "eval":
                    return this.eval(this.eval(list[1], env), env);
                case "quote":
                    return list[1];
                case "quasiquoteexpand":
                    if (list.length != 2)
                        throw new Error("Invalid number of arguments to quasiquote");
                    return this.quasiquote(list[1]);
                case "quasiquote":
                    if (list.length != 2)
                        throw new Error("Invalid number of arguments to quasiquote");
                    return this.eval(this.quasiquote(list[1]), env);
            }
            // if(list[0].type === "Function") {
            //     return this.applyList(list);
            // }
            const evaluated = this.eval_ast(evalast, env);
            const evaluatedList = evaluated.value;
            if (evaluatedList[0].type === "Function") {
                return this.applyList(evaluatedList);
            }
        }
        ;
        return this.eval_ast(evalast, env);
    }
    static quasiquote(ast) {
        switch (ast.type) {
            case "List":
                const list = ast.value;
                if (list.length === 0)
                    return ast;
                if (list[0].value === "unquote")
                    return list[1];
                const concat = [];
                let listElements = [];
                for (let el of list) {
                    if (el.type === "List" && el.value[0].value === "splice-unquote") {
                        concat.push((0, types_1.Instance)(listElements, "List"));
                        listElements = [];
                        concat.push(el.value[1]);
                        continue;
                    }
                    listElements.push(this.quasiquote(el));
                }
                if (listElements.length != 0)
                    concat.push((0, types_1.Instance)(listElements, "List"));
                return (0, types_1.Instance)([(0, types_1.Instance)("concat", "Symbol"), ...concat], "List");
            case "Symbol":
                return (0, types_1.Instance)([(0, types_1.Instance)("quote", "Symbol"), ast], "List");
            default:
                return ast;
        }
    }
    static applyList(evaluatedList) {
        const listFunction = evaluatedList[0].value.fun;
        return listFunction(...evaluatedList.slice(1));
    }
    static print(exp) {
        return printer_1.default.pr_str(exp, true);
    }
    static rep(str, env) {
        return this.print(this.eval(this.read(str), env));
    }
}
exports.default = Interpreter;
