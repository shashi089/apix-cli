import pc from 'picocolors';
import { generateTests } from '../../generator/index.js';

export async function generateHandler(options: { from: string, force?: boolean }) {
    console.log(pc.cyan(`Parsing OpenAPI spec: ${options.from}`));

    const force = !!options.force;
    generateTests(options.from, force);
}
