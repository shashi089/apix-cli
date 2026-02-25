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

export interface HttpClientLike {
    request(req: HttpRequest): Promise<HttpResponse>;
    get(url: string, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse>;
    post(url: string, body?: any, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse>;
    put(url: string, body?: any, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse>;
    patch(url: string, body?: any, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse>;
    delete(url: string, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse>;
}

export interface TestContext {
    /** Fluent HTTP client — use request.get(), request.post(), request.delete() etc. */
    request: HttpClientLike;
    /** Alias for request (fluent HTTP client) */
    api: HttpClientLike;
    expect: any;
}
