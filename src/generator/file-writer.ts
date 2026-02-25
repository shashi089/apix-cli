import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

export function writeTestFile(segment: string, method: string, apiPath: string, content: string, force: boolean): void {
    const testsDir = path.join(process.cwd(), 'tests');
    const groupDir = path.join(testsDir, segment);

    if (!fs.existsSync(groupDir)) {
        fs.mkdirSync(groupDir, { recursive: true });
    }

    let sanitizedPath = apiPath.replace(/\//g, '-').replace(/[{}]/g, '');
    if (sanitizedPath.startsWith('-')) {
        sanitizedPath = sanitizedPath.substring(1);
    }
    if (!sanitizedPath) {
        sanitizedPath = 'root';
    }

    const fileName = `${method.toLowerCase()}-${sanitizedPath}.test.ts`;
    const filePath = path.join(groupDir, fileName);

    if (fs.existsSync(filePath) && !force) {
        console.log(pc.yellow(`  Skipped: tests/${segment}/${fileName} (already exists, use --force)`));
        return;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(pc.green(`  Generated: tests/${segment}/${fileName}`));
}
