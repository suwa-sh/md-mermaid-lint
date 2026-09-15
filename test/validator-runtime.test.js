import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('validator runtime', () => {
  test('validatorを読み込んだ場合、インストール済みMermaidバンドルを参照すること', async () => {
    //------------------------------
    // 準備 (Arrange)
    //------------------------------
    const validatorPath = join(__dirname, '..', 'bin', 'validator.js');

    //------------------------------
    // 実行 (Act)
    //------------------------------
    const validatorSource = await fs.readFile(validatorPath, 'utf-8');

    //------------------------------
    // 検証 (Assert)
    //------------------------------
    expect(validatorSource).toContain("../node_modules/mermaid/dist/mermaid.min.js");
    expect(validatorSource).toContain('await page.addScriptTag({ path: mermaidScriptPath });');
    expect(validatorSource).not.toContain('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js');
  });
});
