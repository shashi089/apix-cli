export class AssertionError extends Error {
    constructor(
        public message: string,
        public expected: any,
        public actual: any
    ) {
        super(message);
        this.name = 'AssertionError';
    }
}

export class Assertions {
    constructor(private actual: any) { }

    toBe(expected: any) {
        if (this.actual !== expected) {
            throw new AssertionError(
                `Expected ${expected} but got ${this.actual}`,
                expected,
                this.actual
            );
        }
    }

    toEqual(expected: any) {
        const actualStr = JSON.stringify(this.actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            throw new AssertionError(
                `Expected ${expectedStr} but got ${actualStr}`,
                expected,
                this.actual
            );
        }
    }

    toContain(substring: string) {
        if (typeof this.actual !== 'string' || !this.actual.includes(substring)) {
            throw new AssertionError(
                `Expected "${this.actual}" to contain "${substring}"`,
                substring,
                this.actual
            );
        }
    }

    toHaveStatus(expected: number) {
        if (this.actual?.status !== expected) {
            throw new AssertionError(
                `Expected status ${expected} but got ${this.actual?.status}`,
                expected,
                this.actual?.status
            );
        }
    }

    toBeTruthy() {
        if (!this.actual) {
            throw new AssertionError(
                `Expected value to be truthy but got ${this.actual}`,
                'truthy value',
                this.actual
            );
        }
    }

    toHaveProperty(key: string) {
        if (typeof this.actual !== 'object' || this.actual === null || !(key in this.actual)) {
            throw new AssertionError(
                `Expected object to have property "${key}"`,
                `object with property "${key}"`,
                this.actual
            );
        }
    }
}

export const expect = (actual: any) => new Assertions(actual);
