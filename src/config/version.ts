import { readFileSync } from 'fs';
import { join } from 'path';
export function getVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
    return packageJson.version;
  } catch (error) {
    console.error('读取package.json失败，使用默认开发版本', error);
    return '0.1.0';
  }
}
