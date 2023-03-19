import { Instance, InstanceType, List } from "./types";

interface EnvData {
    [symbol: string]: InstanceType
}

export default class Env {
    private outer?: Env;
    public data: EnvData;

    constructor(outer?: Env, binds?: List, exprs?: List) {
        this.outer = outer;
        this.data = {};
        
        if(!binds || !exprs) return;

        for (let i = 0; i < binds.length; i++) {
            const bind = binds[i];
            const key = bind.value as string;
            if(key[key.length-1] === "&") {
                this.data[key.slice(0, -1)] = Instance(exprs.slice(i), "List");
                break;
            }
            if(exprs[i]) this.data[key] = exprs[i];
        }
        
    }

    set(symbol: string, value: InstanceType) {
        this.data[symbol] = value;
    }

    find(symbol: string): Env | undefined {
        if(this.data[symbol]) return this;
        return this.outer?.find(symbol);
    }

    get(symbol: string): InstanceType {
        const env = this.find(symbol);
        const data = env?.data[symbol];
        if(data) return data;
        throw new ReferenceError(`Unbound symbol ${symbol}`);
    }
}