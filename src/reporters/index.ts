import { ReporterConfig } from '../types/index.js';
import { ReportSummary } from './types.js';
import { writeJsonReport } from './json.js';
import { writeHtmlReport } from './html.js';

const DEFAULT_OUT_DIR = './apix-reports';

/**
 * Runs all enabled reporters after a test run completes.
 * No-op if config.reporters is undefined.
 */
export async function runReporters(
    summary: ReportSummary,
    reporterConfig: ReporterConfig | undefined
): Promise<void> {
    if (!reporterConfig) return;

    const outDir = reporterConfig.outDir ?? DEFAULT_OUT_DIR;

    if (reporterConfig.json) {
        writeJsonReport(summary, outDir);
    }

    if (reporterConfig.html) {
        writeHtmlReport(summary, outDir);
    }
}
