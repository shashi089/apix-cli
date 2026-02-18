import { registry } from './registry.js';
import { expect as internalExpect } from '../assertions/index.js';
import { TestContext } from '../types/index.js';

/**
 * Defines a test case using the global DSL.
 * Calling test() registers the case into the singleton registry,
 * which the runner reads when executing a file.
 */
export function test(name: string, fn: (ctx: TestContext) => Promise<void>) {
    registry.register({
        name,
        run: fn
    });
}

/**
 * Global expect function — re-exported from assertions/ for DSL consumers.
 */
export const expect = internalExpect;
