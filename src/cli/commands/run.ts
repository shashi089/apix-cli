import { pathToFileURL } from 'node:url';
import path from 'node:path';
import glob from 'fast-glob';
import { ConfigLoader } from '../../config/loader.js';
import { TestRunner } from '../../runner/index.js';
import { logger } from '../../utils/logger.js';
import { TestSuite } from '../../types/index.js';
import { ResultCollector } from '../../reporters/collector.js';
import { runReporters } from '../../reporters/index.js';

export async function runHandler(pattern: string = '**/*.test.ts') {
    const loader = new ConfigLoader();
    const config = await loader.loadConfig();
    const runner = new TestRunner(config);
    const collector = new ResultCollector();

    const testFiles = await glob(pattern, { absolute: true });

    if (testFiles.length === 0) {
        logger.warn(`No test files found matching: ${pattern}`);
        return;
    }

    let totalPassed = 0;
    let totalFailed = 0;
    const startTime = performance.now();
    const { registry } = await import('../../dsl/registry.js');

    for (const file of testFiles) {
        try {
            registry.clear();
            // Importing the file will trigger 'test()' calls (DSL style)
            const mod = await import(pathToFileURL(file).toString() + `?t=${Date.now()}`);

            // Support both patterns:
            // 1. DSL-style: test() calls that register into the registry
            // 2. Exported TestSuite object (default export with .tests array)
            let tests = registry.getTests();

            if (tests.length === 0 && mod.default && Array.isArray(mod.default.tests)) {
                const suite = mod.default as TestSuite;
                tests = suite.tests;
            }

            if (tests.length === 0) {
                logger.warn(`Skipping ${path.basename(file)}: No tests found`);
                continue;
            }

            const suiteName = (mod.default as TestSuite)?.name ?? path.basename(file);
            const suiteStart = performance.now();
            const results = await runner.runTests(tests, suiteName);
            const suiteDuration = Math.round(performance.now() - suiteStart);

            // Collect results for reporting
            collector.addSuite(suiteName, results, suiteDuration);

            totalPassed += results.filter(r => r.passed).length;
            totalFailed += results.filter(r => !r.passed).length;
        } catch (error: any) {
            logger.error(`Failed to load/run test file: ${file}`, error);
            totalFailed++;
        }
    }

    const duration = Math.round(performance.now() - startTime);
    logger.summary(totalPassed, totalFailed, totalPassed + totalFailed, duration);

    // Generate reports (no-op if reporters not configured)
    await runReporters(collector.getSummary(), config.reporters);

    if (totalFailed > 0) {
        process.exit(1);
    }
}
