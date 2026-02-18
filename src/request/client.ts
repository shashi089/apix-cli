import { HttpRequest, HttpResponse, Config } from '../types/index.js';

export class HttpClient {
    constructor(private config: Config = {}) { }

    async request(req: HttpRequest): Promise<HttpResponse> {
        const start = performance.now();

        let fullUrl = req.url;
        if (this.config.baseUrl && !req.url.startsWith('http')) {
            fullUrl = new URL(req.url, this.config.baseUrl).toString();
        }

        if (req.params) {
            const urlObj = new URL(fullUrl);
            Object.entries(req.params).forEach(([key, value]) => {
                urlObj.searchParams.append(key, value);
            });
            fullUrl = urlObj.toString();
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add config headers (filter out undefined values)
        if (this.config.headers) {
            Object.entries(this.config.headers).forEach(([key, value]) => {
                if (value !== undefined) {
                    headers[key] = value;
                }
            });
        }

        // Add request headers (filter out undefined values)
        if (req.headers) {
            Object.entries(req.headers).forEach(([key, value]) => {
                if (value !== undefined) {
                    headers[key] = value;
                }
            });
        }

        try {
            const response = await fetch(fullUrl, {
                method: req.method || 'GET',
                headers,
                body: req.body ? JSON.stringify(req.body) : undefined,
                signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
            });

            const contentType = response.headers.get('content-type');
            let body: any;

            if (contentType?.includes('application/json')) {
                body = await response.json();
            } else {
                body = await response.text();
            }

            const duration = Math.round(performance.now() - start);

            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            return {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                body,
                duration,
            };
        } catch (error: any) {
            const duration = Math.round(performance.now() - start);
            throw {
                message: error.message,
                duration,
                cause: error
            };
        }
    }

    /** Performs a GET request */
    async get(url: string, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse> {
        return this.request({ url, method: 'GET', headers: options?.headers, params: options?.params });
    }

    /** Performs a POST request */
    async post(url: string, body?: any, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse> {
        return this.request({ url, method: 'POST', body, headers: options?.headers, params: options?.params });
    }

    /** Performs a PUT request */
    async put(url: string, body?: any, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse> {
        return this.request({ url, method: 'PUT', body, headers: options?.headers, params: options?.params });
    }

    /** Performs a PATCH request */
    async patch(url: string, body?: any, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse> {
        return this.request({ url, method: 'PATCH', body, headers: options?.headers, params: options?.params });
    }

    /** Performs a DELETE request */
    async delete(url: string, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<HttpResponse> {
        return this.request({ url, method: 'DELETE', headers: options?.headers, params: options?.params });
    }
}
