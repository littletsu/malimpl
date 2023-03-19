"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Printer {
    static pr_str_readably(exp) {
        let out = '"';
        for (let char of exp) {
            out += char === '\n' ? '\\n' : char;
        }
        out += '"';
        return out;
    }
    static pr_seq(exp, open, close) {
        const list = exp.value;
        return open + list.map(instance => this.pr_str(instance, true)).join(' ') + close;
    }
    static pr_str(exp, readably) {
        switch (exp.type) {
            case "List":
                return this.pr_seq(exp, '(', ')');
            case "Vector":
                return this.pr_seq(exp, '[', ']');
            case "HashMap":
                return this.pr_seq(exp, '{', '}');
            case "String":
                return readably ? this.pr_str_readably(exp.value) : exp.value;
            case "Function":
                return "#<function>";
            case "EOF":
                return "";
            default:
                return exp.value.toString();
        }
    }
}
exports.default = Printer;
