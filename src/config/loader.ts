import { Config } from '../types/index.js';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { logger } from '../utils/logger.js';
import { config as loadEnv } from 'dotenv';

export class ConfigLoader {
    async loadConfig(): Promise<Config> {
        // Load .env file first
        this.loadEnvFile();

        // Determine environment
        const env = process.env.NODE_ENV || 'development';

        // Try environment-specific config first, then fallback to default
        const configPaths = [
            path.join(process.cwd(), `apix.config.${env}.ts`),
            path.join(process.cwd(), `apix.config.${env}.js`),
            path.join(process.cwd(), 'apix.config.ts'),
            path.join(process.cwd(), 'apix.config.js'),
        ];

        for (const configPath of configPaths) {
            if (fs.existsSync(configPath)) {
                try {
                    // Note: In ESM, importing .ts files requires a loader (e.g., tsx)
                    // We assume the caller is running with a loader or config is compiled
                    const module = await import(pathToFileURL(configPath).toString());
                    logger.dim(`Loaded config from: ${path.basename(configPath)}`);
                    return module.default || module;
                } catch (error) {
                    // If it fails due to extension, we might be missing a loader
                    logger.warn(`Could not load config from ${configPath}. Ensure you are running with a TS loader (e.g. tsx).`);
                }
            }
        }

        return {}; // Default empty config
    }

    private loadEnvFile(): void {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            loadEnv({ path: envPath });
            logger.dim('Loaded environment variables from .env');
        }
    }
}
