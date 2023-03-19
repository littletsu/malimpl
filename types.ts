export type InstancedType = "Symbol" | "Keyword" | "Vector" | "String" | "List" | "Number" | "Boolean" | "HashMap" | "Function" | "EOF";
export const EOF = Instance(false, "EOF");
export const nil = Instance(false, "Boolean");
export const yes = Instance(true, "Boolean");
export interface InstanceType {
    type: InstancedType,
    value: Type
}
export function Instance(value: Type, type: InstancedType): InstanceType {
    return {
        type,
        value
    };
}
export function EnvFunctionInstance (f: EnvFunction) {
    return Instance(f, "Function");
}
export type EnvFunction = (...args: InstanceType[]) => InstanceType;
export interface Namespace {
    [symbol: string]: InstanceType;
}
export type List = Array<InstanceType>;
export type Type = Array<Type> | Number | string | boolean | List | EnvFunction;