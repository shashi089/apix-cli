import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

export class FileWatcher {
    private watchCallback: () => Promise<void>;
    private debounceTimer: NodeJS.Timeout | null = null;
    private debounceMs: number;
    private isRunning: boolean = false;
    private watchers: fs.FSWatcher[] = [];

    constructor(callback: () => Promise<void>, debounceMs: number = 300) {
        this.watchCallback = callback;
        this.debounceMs = debounceMs;
    }

    public watch(testsDir: string, configFile: string) {
        // Setup Ctrl+C handler
        process.on('SIGINT', () => {
            console.log(pc.yellow('\nStopping watcher...'));
            this.close();
            process.exit(0);
        });

        const handleEvent = () => {
            if (this.isRunning) return; // Prevent overlapping runs

            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            this.debounceTimer = setTimeout(async () => {
                this.isRunning = true;
                console.clear();
                console.log(pc.cyan('🔄 File change detected. Re-running tests...\n'));

                try {
                    await this.watchCallback();
                } catch (error) {
                    console.error(pc.red('Error during test run:'), error);
                } finally {
                    this.isRunning = false;
                    console.log(pc.gray('\nWatching for changes... (Press Ctrl+C to stop)'));
                }
            }, this.debounceMs);
        };

        // Watch tests directory
        if (fs.existsSync(testsDir)) {
            const testWatcher = fs.watch(testsDir, { recursive: true }, handleEvent);
            this.watchers.push(testWatcher);
        }

        // Watch config file
        if (fs.existsSync(configFile)) {
            const configWatcher = fs.watch(configFile, handleEvent);
            this.watchers.push(configWatcher);
        }

        console.clear();
        // Run tests immediately on start
        this.isRunning = true;
        this.watchCallback().finally(() => {
            this.isRunning = false;
            console.log(pc.gray('\nWatching for changes... (Press Ctrl+C to stop)'));
        });
    }

    public close() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        for (const watcher of this.watchers) {
            watcher.close();
        }
    }
}
