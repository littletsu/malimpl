import repl from 'node:repl';
import Interpreter from './interpreter';
import Env from './env';
import core from './core';
import { displayHelp, getArgsObj, setCommands } from './argslib';
import { Instance } from './types';

setCommands([{
    option: '-e',
    aliases: [],
    description: 'Eval string',
    displayArgs: '[string]',
    requiresArgs: true,
    setVar: 'e'
}, {
    option: '-help',
    aliases: ['-?', '-h'],
    description: 'Show list of commands and exit',
    displayArgs: '',
    requiresArgs: false,
    setVar: 'help'
}])

const args = getArgsObj();

if(args.help) displayHelp();

const env = new Env();

for (let symbol of Object.keys(core)) {
    env.set(symbol, core[symbol]);
}

env.set("argv", Instance(process.argv.map(value => Instance(value, "String")), "List"));

Interpreter.rep(`(def! not (fn* (a) (if a false true)))`, env);
Interpreter.rep(`(def! load-file (fn* (f) (eval (read-str (str "(do " (slurp f) " nil)")))))`, env);

if(args.e) Interpreter.rep(args.e as string, env);

const r = repl.start({ prompt: 'user> ', eval: readline, writer: writer });

function readline(cmd: string, context: unknown, file: string, callback: (err: Error | null, out: any) => void) {
    callback(null, Interpreter.rep(cmd, env));
}

function writer(output: string) {
    return output
}