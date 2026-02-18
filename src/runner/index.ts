import { TestResult, TestContext, Config, TestCase, HttpRequest, HttpResponse } from '../types/index.js';
import { HttpClient } from '../request/client.js';
import { expect } from '../assertions/index.js';
import { logger } from '../utils/logger.js';
import { OpenApiValidator } from '../openapi/index.js';

/**
 * TestRunner — orchestrates a single test suite run.
 *
 * Responsibilities:
 *   - Build the TestContext (request wrapper + expect + api)
 *   - Execute each test case
 *   - Log pass/fail per test
 *   - Return structured TestResult[]
 *
 * Does NOT: load config, find files, collect reports, or exit the process.
 * Those concerns live in cli/commands/run.ts.
 */
export class TestRunner {
    private client: HttpClient;
    private openApiValidator: OpenApiValidator | null = null;

    constructor(private config: Config) {
        this.client = new HttpClient(config);
        if (config.openapi) {
            this.openApiValidator = new OpenApiValidator(config.openapi);
        }
    }

    async runTests(tests: TestCase[], suiteName: string): Promise<TestResult[]> {
        const results: TestResult[] = [];

        logger.suiteHeader(suiteName);

        for (const test of tests) {
            const testStartTime = performance.now();
            let lastResponse: HttpResponse | undefined;

            try {
                const validator = this.openApiValidator;

                const ctx: TestContext = {
                    request: async (req: HttpRequest) => {
                        const res = await this.client.request(req);
                        lastResponse = res;

                        if (validator) {
                            // Extract pathname without base URL or query string
                            let requestPath = req.url;
                            try {
                                const urlObj = new URL(req.url, this.config.baseUrl || 'http://localhost');
                                requestPath = urlObj.pathname;
                            } catch {
                                // If URL parsing fails, use raw url as-is
                            }

                            await validator.validate(
                                req.method ?? 'GET',
                                requestPath,
                                res.status,
                                res.body
                            );
                        }

                        return res;
                    },
                    expect,
                    api: this.client,
                };

                await test.run(ctx);

                const duration = Math.round(performance.now() - testStartTime);
                logger.testPass(test.name, duration);
                results.push({ name: test.name, passed: true, duration });

            } catch (error: any) {
                const duration = Math.round(performance.now() - testStartTime);
                logger.testFail(test.name, duration, error, lastResponse?.body);
                results.push({ name: test.name, passed: false, duration, error, response: lastResponse });
            }
        }

        return results;
    }
}
