import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { initHandler } from './commands/init.js';
import { runHandler } from './commands/run.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '../../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

export const program = new Command();

program
    .name('apix')
    .description(pc.cyan('apix: TypeScript-first CLI API testing framework'))
    .version(pkg.version, '-v, --version', pc.yellow('Show the current version'));

program
    .command('init')
    .description('Initialize a new apix project')
    .action(async () => {
        await initHandler();
    });

program
    .command('run')
    .description('Run API tests')
    .argument('[pattern]', 'Glob pattern for test files', '**/*.test.ts')
    .action(async (pattern) => {
        await runHandler(pattern);
    });

// Handle unknown commands
program.on('command:*', () => {
    console.error(pc.red('Invalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
    process.exit(1);
});

export function runCLI() {
    if (process.argv.length <= 2) {
        program.help();
    }
    program.parse(process.argv);
}
