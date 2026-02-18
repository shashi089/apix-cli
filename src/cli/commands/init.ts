import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../utils/logger.js';

export async function initHandler() {
    const configPath = path.join(process.cwd(), 'apix.config.ts');
    const envPath = path.join(process.cwd(), '.env.example');

    if (fs.existsSync(configPath)) {
        logger.warn('apix.config.ts already exists.');
        return;
    }

    const configContent = `import { Config } from './src/types/index.js';

const config: Config = {
  baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  headers: {
    'Accept': 'application/json',
    'Authorization': process.env.API_TOKEN ? \`Bearer \${process.env.API_TOKEN}\` : undefined
  }
};

export default config;
`;

    const envContent = `# apix Environment Configuration
# Copy this file to .env and update with your values

# API Configuration
API_BASE_URL=https://api.example.com
API_TIMEOUT=5000
API_TOKEN=your_api_token_here

# Environment
NODE_ENV=development
`;

    const sampleTestContent = `import { test, expect } from '../src/core/dsl.js';

test('Sample: GET request example', async ({ api }) => {
  const res = await api.get('/posts/1');
  
  expect(res).toHaveStatus(200);
  expect(res.body).toHaveProperty('id');
});

test('Sample: POST request example', async ({ api }) => {
  const res = await api.post('/posts', {
    title: 'Test Post',
    body: 'This is a test',
    userId: 1
  });
  
  expect(res).toHaveStatus(201);
  expect(res.body).toHaveProperty('id');
});
`;

    try {
        fs.writeFileSync(configPath, configContent);
        logger.success('Created apix.config.ts');

        fs.writeFileSync(envPath, envContent);
        logger.success('Created .env.example');

        // Create examples directory and sample test
        const examplesDir = path.join(process.cwd(), 'examples');
        if (!fs.existsSync(examplesDir)) {
            fs.mkdirSync(examplesDir);
        }

        const sampleTestPath = path.join(examplesDir, 'sample.test.ts');
        fs.writeFileSync(sampleTestPath, sampleTestContent);
        logger.success('Created examples/sample.test.ts');

        logger.info('\n✨ apix project initialized successfully!\n');
        logger.info('Next steps:');
        logger.info('1. Copy .env.example to .env and update with your credentials');
        logger.info('2. Update apix.config.ts with your API settings');
        logger.info('3. Run your first test: apix run examples/sample.test.ts');
    } catch (error: any) {
        logger.error('Failed to initialize project', error);
    }
}
