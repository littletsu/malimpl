import { Instance, Type, InstanceType, EOF, List, InstancedType } from "./types";

class TokenReader {
    private tokens: string[];
    private i: number = 0;

    constructor(tokens: string[]) {
        this.tokens = tokens;
    }

    public peek() {
        return this.tokens[this.i] ?? null;
    }

    public next(count: number=1) {
        return this.tokens[this.i+=count] ?? null;
    }
}

export default class Reader {
    // [\s,]*
    static TOKEN_REGEX = /(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
    static NUMBER_REGEX = /^-?\d+\.?\d*/;
    static HASHMAP_KEY_TYPES: InstancedType[] = ["Symbol", "Keyword", "Number"];

    static tokenize(str: string): string[] {
        return str.match(this.TOKEN_REGEX) || [];
    }

    static read_str(str: string) {
        const tokens = this.tokenize(str).filter(token => token !== '');
        const reader = new TokenReader(tokens);
        return this.read_form(reader);
    }

    static read_seq(reader: TokenReader, close: string) {
        let token: string | null = null;
        let list = [];
        while((token = reader.next()) !== close) {
            if(token === null) {
                throw new SyntaxError(`Reached EOF before "${close}"`);
            }
            list.push(this.read_form(reader));
        }
        return list;
    }

    static read_hashmap(reader: TokenReader) {
        const hashmap = Instance(this.read_seq(reader, '}'), 'HashMap');
        const data = hashmap.value as List;
        if((data.length % 2) !== 0) throw new Error("HashMap key without value");
        for(let i = 0; i < data.length; i++) {
            const isKey = ((i + 1) % 2) === 1;
            if(isKey && (this.HASHMAP_KEY_TYPES.indexOf(data[i].type) == -1)) 
                throw new Error(`HashMap key type can only be ${this.HASHMAP_KEY_TYPES.join(' | ')}. Received ${data[i].type}`);
        }
        return hashmap;
    }

    static read_atom(reader: TokenReader) {
        const atom = reader.peek();
        const matchNumber = atom.match(this.NUMBER_REGEX);
        if(matchNumber && matchNumber[0].length === atom.length) return Instance(Number(atom), "Number");
        switch(atom[0]) {
            case '"':
                let i = 0;
                let str = ""
                while(atom[++i] !== '"') {
                    let token = atom[i];
                    switch(token) {
                        case undefined:
                            throw new SyntaxError("Reached EOF before matching \"");
                        case "\\":
                            token = atom[++i];
                            if(token === "n") token = "\n";
                        default:
                            str += token;
                    }
                }
                return Instance(str, "String");
            case ";":
                return EOF;
            case ":":
                return Instance(atom.toUpperCase(), "Keyword");
        }
        switch(atom) {
            case 'true':
                return Instance(true, "Boolean");
            case 'nil':
            case 'false':
                return Instance(false, "Boolean");
        }
        return Instance(atom, "Symbol");
    }

    static reader_macro(reader: TokenReader, symbol: string): InstanceType {
        reader.next();
        return Instance([Instance(symbol, "Symbol"), this.read_form(reader)], "List");
    }

    static read_form(reader: TokenReader): InstanceType {
        const token = reader.peek();
        if(!token) return EOF;
        switch(token[0]) {
            case '(':
                return Instance(this.read_seq(reader, ')'), 'List');
            case ')':
                throw new SyntaxError("Unexpected \")\"");
            case '[':
                return Instance(this.read_seq(reader, ']'), 'Vector');
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
                if(token[1] === "@") return this.reader_macro(reader, "splice-unquote");
                return this.reader_macro(reader, "unquote");
            default:
                return this.read_atom(reader);
                
        }
    }
}