export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface HttpRequest {
    url: string;
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, string>;
}

export interface HttpResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    duration: number; // in ms
}

export interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    error?: Error;
    request?: HttpRequest;
    response?: HttpResponse;
}

export interface OpenApiConfig {
    specPath: string;
    strict?: boolean;
}

export interface ReporterConfig {
    outDir?: string;   // default: './apix-reports'
    json?: boolean;    // write report.json
    html?: boolean;    // write report.html
}

export interface Config {
    baseUrl?: string;
    timeout?: number;
    headers?: Record<string, string | undefined>;
    openapi?: OpenApiConfig;
    reporters?: ReporterConfig;
}

export interface TestSuite {
    name: string;
    tests: TestCase[];
}

export interface TestCase {
    name: string;
    run: (ctx: TestContext) => Promise<void>;
}

export interface TestContext {
    request: (req: HttpRequest) => Promise<HttpResponse>;
    expect: any; // Will be defined in assertions
    api: any; // HttpClient instance (typed as any to avoid circular dependency)
}
