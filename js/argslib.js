"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgsObj = exports.displayHelp = exports.setCommands = void 0;
let commands = [];
const setCommands = (newCommands) => {
    commands = newCommands;
};
exports.setCommands = setCommands;
const displayHelp = (m, exit = true) => {
    console.log(`${m ? m + '\n\n' : ''}\nHelp:\n${commands.sort((a, b) => (a.option > b.option) ? 1 : ((b.option > a.option) ? -1 : 0))
        .map(cmd => `\t${cmd.option} ${cmd.requiresArgs ? cmd.displayArgs + ' ' : ''}- ${cmd.description}`).join('\n')}`);
    if (exit)
        process.exit();
};
exports.displayHelp = displayHelp;
const getArgsObj = () => {
    let argsObj = {};
    process.argv.forEach((arg, i) => {
        let argument = arg.toLowerCase();
        let command = commands.find(command => (command.option === argument) || (command.aliases.indexOf(argument) !== -1));
        if (command) {
            if (command.requiresArgs) {
                if (process.argv[i + 1] ? process.argv[i + 1].startsWith('-') : true) {
                    argsObj[command.setVar] = null;
                }
                else {
                    argsObj[command.setVar] = process.argv[i + 1] || null;
                }
            }
            else {
                argsObj[command.setVar] = true;
            }
        }
    });
    return argsObj;
};
exports.getArgsObj = getArgsObj;
exports.default = {
    setCommands: exports.setCommands,
    displayHelp: exports.displayHelp,
    getArgsObj: exports.getArgsObj
};
