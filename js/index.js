"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_repl_1 = __importDefault(require("node:repl"));
const interpreter_1 = __importDefault(require("./interpreter"));
const env_1 = __importDefault(require("./env"));
const core_1 = __importDefault(require("./core"));
const argslib_1 = require("./argslib");
const types_1 = require("./types");
(0, argslib_1.setCommands)([{
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
    }]);
const args = (0, argslib_1.getArgsObj)();
if (args.help)
    (0, argslib_1.displayHelp)();
const env = new env_1.default();
for (let symbol of Object.keys(core_1.default)) {
    env.set(symbol, core_1.default[symbol]);
}
env.set("argv", (0, types_1.Instance)(process.argv.map(value => (0, types_1.Instance)(value, "String")), "List"));
interpreter_1.default.rep(`(def! not (fn* (a) (if a false true)))`, env);
interpreter_1.default.rep(`(def! load-file (fn* (f) (eval (read-str (str "(do " (slurp f) " nil)")))))`, env);
interpreter_1.default.rep(`(defmacro! uwu (fn* () '(list)))`, env);
if (args.e)
    interpreter_1.default.rep(args.e, env);
const r = node_repl_1.default.start({ prompt: 'user> ', eval: readline, writer: writer });
function readline(cmd, context, file, callback) {
    callback(null, interpreter_1.default.rep(cmd, env));
}
function writer(output) {
    return output;
}
