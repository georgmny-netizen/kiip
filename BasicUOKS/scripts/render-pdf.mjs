import fs from 'node:fs';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';

const SRC = path.resolve('..', 'sources');
const OUT = path.resolve('..', 'sources-png');
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  { in: 'учебник.pdf', prefix: 'tb', pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { in: '20250422123602130.pdf', prefix: 'wb', pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
];

for (const j of jobs) {
  const data = new Uint8Array(fs.readFileSync(path.join(SRC, j.in)));
  const parser = new PDFParse({ data });
  const result = await parser.getScreenshot({ pages: j.pages, scale: 1.5 });
  for (const p of result.pages) {
    const file = path.join(OUT, `${j.prefix}-${String(p.pageNumber).padStart(3, '0')}.png`);
    fs.writeFileSync(file, p.data);
    console.log(file);
  }
  await parser.destroy?.();
}
