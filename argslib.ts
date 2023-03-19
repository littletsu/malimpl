interface Command {
    option: string,
    aliases: string[],
    description: string,
    displayArgs: string,
    requiresArgs: boolean,
    setVar: string
}

let commands: Command[] = [];

export const setCommands = (newCommands: Command[]) => {
    commands = newCommands;
}


export const displayHelp = (m?: string, exit=true) => {
    console.log(`${m ? m + '\n\n' : ''}\nHelp:\n${commands.sort((a,b) => (a.option > b.option) ? 1 : ((b.option > a.option) ? -1 : 0))
        .map(cmd => `\t${cmd.option} ${cmd.requiresArgs ? cmd.displayArgs + ' ' : ''}- ${cmd.description}`).join('\n')}`);
    if(exit) process.exit();
}

interface Args {
    [option: string]: unknown
}

export const getArgsObj = () => {
    let argsObj: Args = {};
    process.argv.forEach((arg, i) => {
        let argument = arg.toLowerCase();
        let command = commands.find(command => (command.option === argument) || (command.aliases.indexOf(argument) !== -1));
        if(command) {
            if(command.requiresArgs) {
                if(process.argv[i+1] ? process.argv[i+1].startsWith('-') : true) {
                    argsObj[command.setVar] = null;  
                } else {
                    argsObj[command.setVar] = process.argv[i+1] || null;
                }
            } else {
                argsObj[command.setVar] = true;
            }
        }
    });
    return argsObj;
}

export default {
    setCommands,
    displayHelp,
    getArgsObj
}