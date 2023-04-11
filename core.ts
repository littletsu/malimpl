import Printer from "./printer";
import Reader from "./reader";
import fs from 'fs';
import { Namespace, InstanceType, Instance, FunctionInstance, nil, List, yes, InstancedType } from "./types";

const eq = (a: InstanceType, b: InstanceType) => {
    if(a.type !== b.type) return nil;
    if(a.type === "List") {
        const aList = (a.value as List);
        const bList = (b.value as List);
        if(aList.length !== bList.length) return nil;
        for(let i = 0; i < aList.length; i++) {
            if(!eq(aList[i], bList[i]).value) return nil
        }
        return yes;
    }
    if(a.value !== b.value) return nil;
    return yes;
}

const core: Namespace = {
    'typeof': FunctionInstance((exp: InstanceType) => Instance(':' + exp.type.toUpperCase(), "Keyword")),
    
    '+': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) + (b.value as number), "Number")),
    '-': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) - (b.value as number), "Number")),
    '*': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) * (b.value as number), "Number")),
    '/': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) / (b.value as number), "Number")),
    '%': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) % (b.value as number), "Number")),

    'prn-str': FunctionInstance((...args: InstanceType[]) => {
        return Instance(args.map(arg => Printer.pr_str(arg, true)).join(' '), "String");
    }),
    str: FunctionInstance((...args: InstanceType[]) => {
        return Instance(args.map(arg => Printer.pr_str(arg, false)).join(''), "String");
    }),
    prn: FunctionInstance((...args: InstanceType[]) => {
        console.log(args.map(arg => Printer.pr_str(arg, true)).join(' '));
        return nil;
    }),
    println: FunctionInstance((...args: InstanceType[]) => {
        console.log(args.map(arg => Printer.pr_str(arg, false)).join(' '));
        return nil;
    }),

    list: FunctionInstance((...args: InstanceType[]) => Instance(args, "List")),
    vec: FunctionInstance((list: InstanceType) => Instance(list.value, "Vector")),
    cons: FunctionInstance((a: InstanceType, b: InstanceType) => Instance([...a.value as List, b], "List")),
    concat: FunctionInstance((...lists: InstanceType[]) => {
        const newList = [];
        for(let list of lists) {
            for(let el of list.value as List) {
                newList.push(el);
            }
        }
        return Instance(newList, "List");
    }),
    count: FunctionInstance((list: InstanceType) => Instance((list.value as List).length, "Number")),

    'list?': FunctionInstance((exp: InstanceType) => Instance(exp.type === "List", "Boolean")),
    'empty?': FunctionInstance((list: InstanceType) => Instance((list.value as List).length === 0, "Boolean")),
    
    '=': FunctionInstance(eq),
    '>': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) > (b.value as number), "Boolean")),
    '<': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) < (b.value as number), "Boolean")),
    '>=': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) >= (b.value as number), "Boolean")),
    '<=': FunctionInstance((a: InstanceType, b: InstanceType) => Instance((a.value as number) <= (b.value as number), "Boolean")),

    'read-str': FunctionInstance((str: InstanceType) => Reader.read_str(str.value as string)),
    slurp: FunctionInstance((str: InstanceType) => Instance(fs.readFileSync(str.value as string, 'utf8'), "String")),

    'splice-unquote': FunctionInstance(() => { throw new SyntaxError("Cannot splice-unquote outside of quote") }),
    unquote: FunctionInstance(() => { throw new SyntaxError("Cannot unquote outside of quote") }),

    js: FunctionInstance((exp: InstanceType) => {
        let evaled = eval(exp.value as string);
        let type: string = typeof evaled;
        type = type[0].toUpperCase() + type.substring(1);
        if(type === "Object") type = "List";
        if(type === "Undefined") (type = "Boolean", evaled = false);
        return Instance(evaled, type as InstancedType);
    })
}

export default core;