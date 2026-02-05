import { test as teardown } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authDir = path.join(__dirname, '.auth');

teardown('cleanup auth files', async () => {
  if (process.env['CI']) {
    try {
      if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true });
      }
    } catch {
    }
  }
});
