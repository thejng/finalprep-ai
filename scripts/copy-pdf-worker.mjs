// Copies the pdf.js worker to public so it can be served from same-origin
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const projectRoot = join(__dirname, '..');
  const source = join(projectRoot, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
  const destDir = join(projectRoot, 'public');
  const dest = join(destDir, 'pdf.worker.min.mjs');
  try {
    await mkdir(destDir, { recursive: true });
    await copyFile(source, dest);
    console.log('Copied pdf.worker.min.mjs to public/.');
  } catch (err) {
    console.warn('Failed to copy pdf.worker.min.mjs:', err?.message || err);
  }
}

main();


