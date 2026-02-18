import { TestCase } from '../types/index.js';

export class TestRegistry {
    private static instance: TestRegistry;
    private tests: TestCase[] = [];

    private constructor() { }

    static getInstance(): TestRegistry {
        if (!TestRegistry.instance) {
            TestRegistry.instance = new TestRegistry();
        }
        return TestRegistry.instance;
    }

    register(test: TestCase) {
        this.tests.push(test);
    }

    getTests(): TestCase[] {
        return [...this.tests];
    }

    clear() {
        this.tests = [];
    }
}

export const registry = TestRegistry.getInstance();
