/**
 * Resolves a local JSON $ref pointer within the same spec document.
 * Only handles internal refs (starting with '#/').
 *
 * @example resolveRef(spec, '#/components/schemas/Pokemon') => { type: 'object', ... }
 */
export function resolveRef(spec: Record<string, any>, ref: string): Record<string, any> {
    if (!ref.startsWith('#/')) {
        throw new Error(`[apix/openapi] Only local $ref is supported. Got: "${ref}"`);
    }

    const parts = ref.slice(2).split('/');
    let current: any = spec;

    for (const part of parts) {
        // JSON Pointer escaping: ~1 = '/', ~0 = '~'
        const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
        if (current == null || typeof current !== 'object' || !(key in current)) {
            throw new Error(`[apix/openapi] Could not resolve $ref: "${ref}" (failed at segment "${key}")`);
        }
        current = current[key];
    }

    return current;
}

/**
 * Recursively resolves all $ref pointers in a schema object.
 * Returns a new schema with all $refs inlined (shallow clone per level).
 */
export function inlineRefs(spec: Record<string, any>, schema: Record<string, any>): Record<string, any> {
    if (schema.$ref) {
        const resolved = resolveRef(spec, schema.$ref);
        return inlineRefs(spec, resolved);
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(schema)) {
        if (Array.isArray(value)) {
            result[key] = value.map((item) =>
                typeof item === 'object' && item !== null ? inlineRefs(spec, item) : item
            );
        } else if (typeof value === 'object' && value !== null) {
            result[key] = inlineRefs(spec, value);
        } else {
            result[key] = value;
        }
    }
    return result;
}
