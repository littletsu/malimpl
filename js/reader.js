"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class TokenReader {
    constructor(tokens) {
        this.i = 0;
        this.tokens = tokens;
    }
    peek() {
        var _a;
        return (_a = this.tokens[this.i]) !== null && _a !== void 0 ? _a : null;
    }
    next(count = 1) {
        var _a;
        return (_a = this.tokens[this.i += count]) !== null && _a !== void 0 ? _a : null;
    }
}
class Reader {
    static tokenize(str) {
        return str.match(this.TOKEN_REGEX) || [];
    }
    static read_str(str) {
        const tokens = this.tokenize(str).filter(token => token !== '');
        const reader = new TokenReader(tokens);
        return this.read_form(reader);
    }
    static read_seq(reader, close) {
        let token = null;
        let list = [];
        while ((token = reader.next()) !== close) {
            if (token === null) {
                throw new SyntaxError(`Reached EOF before "${close}"`);
            }
            list.push(this.read_form(reader));
        }
        return list;
    }
    static read_hashmap(reader) {
        const hashmap = (0, types_1.Instance)(this.read_seq(reader, '}'), 'HashMap');
        const data = hashmap.value;
        if ((data.length % 2) !== 0)
            throw new Error("HashMap key without value");
        for (let i = 0; i < data.length; i++) {
            const isKey = ((i + 1) % 2) === 1;
            if (isKey && (this.HASHMAP_KEY_TYPES.indexOf(data[i].type) == -1))
                throw new Error(`HashMap key type can only be ${this.HASHMAP_KEY_TYPES.join(' | ')}. Received ${data[i].type}`);
        }
        return hashmap;
    }
    static read_atom(reader) {
        const atom = reader.peek();
        const matchNumber = atom.match(this.NUMBER_REGEX);
        if (matchNumber && matchNumber[0].length === atom.length)
            return (0, types_1.Instance)(Number(atom), "Number");
        switch (atom[0]) {
            case '"':
                let i = 0;
                let str = "";
                while (atom[++i] !== '"') {
                    let token = atom[i];
                    switch (token) {
                        case undefined:
                            throw new SyntaxError("Reached EOF before matching \"");
                        case "\\":
                            token = atom[++i];
                            if (token === "n")
                                token = "\n";
                        default:
                            str += token;
                    }
                }
                return (0, types_1.Instance)(str, "String");
            case ";":
                return types_1.EOF;
            case ":":
                return (0, types_1.Instance)(atom.toUpperCase(), "Keyword");
        }
        switch (atom) {
            case 'true':
                return (0, types_1.Instance)(true, "Boolean");
            case 'false':
                return (0, types_1.Instance)(false, "Boolean");
            case 'nil':
                return (0, types_1.Instance)(false, "Boolean");
        }
        return (0, types_1.Instance)(atom, "Symbol");
    }
    static reader_macro(reader, symbol) {
        reader.next();
        let form = this.read_form(reader);
        return (0, types_1.Instance)([(0, types_1.Instance)(symbol, "Symbol"), form], "List");
    }
    static read_form(reader) {
        const token = reader.peek();
        if (!token)
            return types_1.EOF;
        switch (token[0]) {
            case '(':
                return (0, types_1.Instance)(this.read_seq(reader, ')'), 'List');
            case ')':
                throw new SyntaxError("Unexpected \")\"");
            case '[':
                return (0, types_1.Instance)(this.read_seq(reader, ']'), 'Vector');
            case ']':
                throw new SyntaxError("Unexpected \"]\"");
            case '{':
                return this.read_hashmap(reader);
            case '}':
                throw new SyntaxError("Unexpected \"}\"");
            case "'":
                return this.reader_macro(reader, "quote");
            case '`':
                return this.reader_macro(reader, "quasiquote");
            case "~":
                if (token[1] === "@")
                    return this.reader_macro(reader, "splice-unquote");
                return this.reader_macro(reader, "unquote");
            default:
                return this.read_atom(reader);
        }
    }
}
exports.default = Reader;
// [\s,]*
Reader.TOKEN_REGEX = /(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
Reader.NUMBER_REGEX = /^-?\d+\.?\d*/;
Reader.HASHMAP_KEY_TYPES = ["Symbol", "Keyword", "Number"];
