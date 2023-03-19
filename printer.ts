import { InstanceType, List } from "./types";

export default class Printer {
    private static pr_str_readably(exp: string) {
        let out = '"';
        for(let char of exp) {
            out += char === '\n' ? '\\n' : char;
        }
        out += '"';
        return out;
    }

    private static pr_seq(exp: InstanceType, open: string, close: string) {
        const list = exp.value as List;
        return open + list.map(instance => this.pr_str(instance, true)).join(' ') + close;
    }

    static pr_str(exp: InstanceType, readably: boolean): string {
        switch(exp.type) {
            case "List":
                return this.pr_seq(exp, '(', ')');
            case "Vector":
                return this.pr_seq(exp, '[', ']');
            case "HashMap":
                return this.pr_seq(exp, '{', '}');
            case "String":
                return readably ? this.pr_str_readably(exp.value as string) : exp.value as string;
            case "Function":
                return "#<function>";
            case "EOF":
                return "";
            default:
                return exp.value.toString();

        }
    }
}
