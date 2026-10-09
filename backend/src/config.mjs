import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(resolve(root, '../.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
export const storage = resolve(root, 'storage');
export const port = Number(process.env.BE_PORT || 4000);
export const host = process.env.BE_HOST || '127.0.0.1';
