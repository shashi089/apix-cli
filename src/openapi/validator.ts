import Ajv, { ValidateFunction } from 'ajv';

const ajv = new Ajv({ allErrors: true });

// Cache: "METHOD:/path:200" => compiled ValidateFunction
const cache = new Map<string, ValidateFunction>();

/**
 * Validates a response body against a JSON Schema.
 * Compiles and caches the validator on first call for a given cacheKey.
 * Throws a descriptive Error if validation fails.
 */
export function validateResponse(
    schema: Record<string, any>,
    body: unknown,
    cacheKey: string
): void {
    let validate = cache.get(cacheKey);

    if (!validate) {
        validate = ajv.compile(schema);
        cache.set(cacheKey, validate);
    }

    const valid = validate(body);

    if (!valid) {
        const errors = validate.errors ?? [];
        const formatted = errors
            .map((e) => {
                const location = e.instancePath || '(root)';
                return `  • ${location}: ${e.message}`;
            })
            .join('\n');

        throw new Error(
            `[apix/openapi] Response body failed schema validation:\n${formatted}`
        );
    }
}
