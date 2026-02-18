import fs from 'node:fs';
import path from 'node:path';
import { ReportSummary } from './types.js';
import { logger } from '../utils/logger.js';

/**
 * Writes a machine-readable JSON report to <outDir>/report.json.
 * Safe for CI artifact upload and programmatic consumption.
 */
export function writeJsonReport(summary: ReportSummary, outDir: string): void {
    fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, 'report.json');
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf-8');

    logger.dim(`JSON report written → ${outPath}`);
}
