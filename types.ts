export type InstancedType = "Symbol" | "Keyword" | "Vector" | "String" | "List" | "Number" | "Boolean" | "HashMap" | "Function" | "EOF";
export const EOF = Instance(false, "EOF");
export const nil = Instance(false, "Boolean");
export const yes = Instance(true, "Boolean");
export interface InstanceType {
    type: InstancedType,
    value: Type
}
export type EnvFunction = (...args: InstanceType[]) => InstanceType;
export interface FunctionValue {
    fun: EnvFunction,
    isMacro: boolean
}
export function Instance(value: Type, type: InstancedType): InstanceType {
    return {
        type,
        value
    };
}
export function FunctionInstance (fun: EnvFunction, isMacro: boolean = false) {
    return Instance({fun, isMacro}, "Function");
}
export interface Namespace {
    [symbol: string]: InstanceType;
}
export type List = Array<InstanceType>;
export type Type = Array<Type> | Number | string | boolean | List | FunctionValue;