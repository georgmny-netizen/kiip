import fs from 'node:fs';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';

const SRC = path.resolve('..', 'sources');
const OUT = path.resolve('..', 'sources-text');
fs.mkdirSync(OUT, { recursive: true });

const files = [
  { in: 'учебник.pdf', out: 'textbook.txt' },
  { in: '20250422123602130.pdf', out: 'workbook.txt' }
];

for (const f of files) {
  const data = new Uint8Array(fs.readFileSync(path.join(SRC, f.in)));
  const parser = new PDFParse({ data });
  const result = await parser.getText();
  fs.writeFileSync(path.join(OUT, f.out), result.text, 'utf8');
  console.log(`${f.in} -> ${f.out}: ${result.total ?? '?'} pages, ${result.text.length} chars`);
  await parser.destroy?.();
}
