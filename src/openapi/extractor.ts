import { inlineRefs } from './resolver.js';
import { HttpMethod } from '../types/index.js';

/**
 * Matches an actual request path (e.g. '/pokemon/ditto') against
 * OpenAPI path templates (e.g. '/pokemon/{name}').
 * Returns the matching template key or null.
 */
function matchPath(specPaths: Record<string, any>, requestPath: string): string | null {
    // Exact match first
    if (requestPath in specPaths) {
        return requestPath;
    }

    // Template match: replace {param} segments with a regex wildcard
    for (const template of Object.keys(specPaths)) {
        const pattern = template
            .replace(/\//g, '\\/')
            .replace(/\{[^}]+\}/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(requestPath)) {
            return template;
        }
    }

    return null;
}

/**
 * Extracts the JSON Schema for a given (method, path, statusCode) triple
 * from an OpenAPI 3.x spec. Returns null if no schema is found.
 */
export function extractSchema(
    spec: Record<string, any>,
    method: HttpMethod,
    requestPath: string,
    statusCode: number
): Record<string, any> | null {
    const paths = spec.paths as Record<string, any> | undefined;
    if (!paths) return null;

    const matchedTemplate = matchPath(paths, requestPath);
    if (!matchedTemplate) return null;

    const methodKey = method.toLowerCase();
    const operation = paths[matchedTemplate]?.[methodKey];
    if (!operation) return null;

    // Try exact status code, then 'default'
    const statusStr = String(statusCode);
    const responseObj = operation.responses?.[statusStr] ?? operation.responses?.['default'];
    if (!responseObj) return null;

    const schema = responseObj.content?.['application/json']?.schema;
    if (!schema) return null;

    // Inline all $ref pointers so Ajv gets a self-contained schema
    return inlineRefs(spec, schema);
}
