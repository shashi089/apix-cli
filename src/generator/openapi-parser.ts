import fs from 'node:fs';
import path from 'node:path';

export interface Endpoint {
    method: string;
    path: string;
    segment: string;
}

export function parseOpenAPI(filePath: string): Endpoint[] {
    const fullPath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`OpenAPI spec not found at: ${fullPath}`);
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const spec = JSON.parse(content);

    const endpoints: Endpoint[] = [];
    const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

    if (!spec.paths) {
        return endpoints;
    }

    for (const [apiPath, pathItem] of Object.entries(spec.paths)) {
        for (const method of Object.keys(pathItem as any)) {
            if (httpMethods.includes(method.toLowerCase())) {
                const segment = extractSegment(apiPath);
                endpoints.push({
                    method: method.toUpperCase(),
                    path: apiPath,
                    segment
                });
            }
        }
    }

    return endpoints;
}

function extractSegment(apiPath: string): string {
    const parts = apiPath.split('/').filter(p => p.length > 0);
    for (const part of parts) {
        if (!part.startsWith('{')) {
            return part; // Use first non-parameter part as segment
        }
    }
    return 'root';
}
