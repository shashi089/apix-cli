import pc from 'picocolors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

function indent(text: string, spaces = 4): string {
    const pad = ' '.repeat(spaces);
    return text.split('\n').map(line => pad + line).join('\n');
}

function truncateBody(body: unknown, maxLen = 400): string {
    const str = typeof body === 'string'
        ? body
        : JSON.stringify(body, null, 2);
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + pc.dim(`\n  … (${str.length - maxLen} more chars)`);
}

// ─── Logger ───────────────────────────────────────────────────────────────────

export const logger = {

    info: (msg: string) =>
        console.log(pc.blue('ℹ ') + msg),

    success: (msg: string) =>
        console.log(pc.green('✔ ') + msg),

    warn: (msg: string) =>
        console.log(pc.yellow('⚠ ') + msg),

    dim: (msg: string) =>
        console.log(pc.dim(msg)),

    step: (msg: string) => {
        console.log('');
        console.log(pc.bold(pc.cyan('❯ ')) + pc.bold(msg));
    },

    error: (msg: string, detail?: any) => {
        console.log(pc.red('✘ ') + msg);
        if (detail) {
            if (detail instanceof Error) {
                console.log(pc.dim(indent(detail.stack || detail.message)));
            } else {
                console.log(pc.dim(indent(JSON.stringify(detail, null, 2))));
            }
        }
    },

    // ── Per-test output ────────────────────────────────────────────────────────

    testPass: (name: string, duration: number) => {
        console.log(
            `  ${pc.green('✓')} ${pc.white(name)} ${pc.dim(formatDuration(duration))}`
        );
    },

    testFail: (name: string, duration: number, error: any, responseBody?: unknown) => {
        console.log(
            `  ${pc.red('✖')} ${pc.bold(pc.white(name))} ${pc.dim(formatDuration(duration))}`
        );

        // AssertionError: show expected vs received
        if (error?.expected !== undefined || error?.actual !== undefined) {
            console.log(`    ${pc.dim('├')} ${pc.dim('Expected:')} ${pc.green(JSON.stringify(error.expected))}`);
            console.log(`    ${pc.dim('└')} ${pc.dim('Received:')} ${pc.red(JSON.stringify(error.actual))}`);
        } else if (error?.message) {
            // Generic error: show message
            const lines = String(error.message).split('\n');
            lines.forEach((line, i) => {
                const connector = i === lines.length - 1 ? '└' : '├';
                console.log(`    ${pc.dim(connector)} ${pc.red(line)}`);
            });
        }

        // Response body (optional, shown when available)
        if (responseBody !== undefined) {
            console.log(`    ${pc.dim('└')} ${pc.dim('Response body:')}`);
            const bodyStr = truncateBody(responseBody);
            bodyStr.split('\n').forEach(line => {
                console.log(`      ${pc.dim(line)}`);
            });
        }

        console.log('');
    },

    // ── Suite separator ────────────────────────────────────────────────────────

    suiteHeader: (name: string) => {
        console.log('');
        console.log(pc.bold(pc.cyan('❯ ')) + pc.bold(name));
    },

    // ── Final summary ──────────────────────────────────────────────────────────

    summary: (passed: number, failed: number, total: number, duration: number) => {
        const line = '─'.repeat(40);
        const status = failed > 0
            ? pc.bgRed(pc.bold(' FAILED '))
            : pc.bgGreen(pc.bold(' PASSED '));

        console.log('\n' + pc.dim(line));
        console.log(`  ${status}  ${pc.dim(formatDuration(duration))}`);
        console.log(pc.dim(line));
        console.log(`  ${pc.green('✓ Passed ')} ${pc.bold(String(passed))}`);
        console.log(`  ${pc.red('✖ Failed ')} ${pc.bold(String(failed))}`);
        console.log(`  ${pc.dim('  Total  ')} ${pc.bold(String(total))}`);
        console.log(pc.dim(line) + '\n');
    },
};
