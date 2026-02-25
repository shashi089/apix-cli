import pc from 'picocolors';
import { parseOpenAPI } from './openapi-parser.js';
import { renderTestTemplate } from './template.js';
import { writeTestFile } from './file-writer.js';

export function generateTests(specPath: string, force: boolean): void {
    try {
        const endpoints = parseOpenAPI(specPath);

        if (endpoints.length === 0) {
            console.log(pc.yellow('No valid endpoints found in the OpenAPI spec.'));
            return;
        }

        console.log(pc.blue(`Found ${endpoints.length} endpoints. Generating tests...`));

        for (const endpoint of endpoints) {
            const content = renderTestTemplate(endpoint.method, endpoint.path);
            writeTestFile(endpoint.segment, endpoint.method, endpoint.path, content, force);
        }

        console.log(pc.green('\nTest generation complete.'));
    } catch (error) {
        console.error(pc.red('Error generating tests:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
