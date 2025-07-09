import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('validator module', () => {
  let validateFile;
  let closeBrowser;

  beforeAll(async () => {
    // Puppeteerベースのvalidatorを直接インポート
    const validatorModule = await import('../bin/validator.js');
    
    validateFile = validatorModule.validateFile;
    closeBrowser = validatorModule.closeBrowser;
  });

  afterAll(async () => {
    // Puppeteerブラウザのクリーンアップ
    if (closeBrowser) {
      await closeBrowser();
    }
  });

  test('有効なMermaid図を検証した場合、エラーが返されないこと', async () => {
    // テスト用の一時ファイルを作成
    const fs = await import('fs/promises');
    const tempFile = join(__dirname, 'temp-valid.md');
    
    const validContent = `# Test Document

This is a test.

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
\`\`\`

End of document.`;

    await fs.writeFile(tempFile, validContent);

    try {
      const errors = await validateFile(tempFile);
      expect(errors).toHaveLength(0);
    } finally {
      // クリーンアップ
      await fs.unlink(tempFile);
    }
  }, 30000);

  test('無効なMermaid図を検証した場合、適切なエラーが返されること', async () => {
    const fs = await import('fs/promises');
    const tempFile = join(__dirname, 'temp-invalid.md');
    
    const invalidContent = `# Test Document

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it?
    B -->|Yes| C[OK]
    B -->|No| D[End]
\`\`\`

End of document.`;

    await fs.writeFile(tempFile, invalidContent);

    try {
      const errors = await validateFile(tempFile);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toHaveProperty('line');
      expect(errors[0]).toHaveProperty('message');
    } finally {
      await fs.unlink(tempFile);
    }
  }, 30000);

  test('Mermaidブロックが複数ある場合、それぞれ検証されること', async () => {
    const fs = await import('fs/promises');
    const tempFile = join(__dirname, 'temp-multiple.md');
    
    const multipleContent = `# Test Document

First block:
\`\`\`mermaid
graph TD
    A --> B
\`\`\`

Second block:
\`\`\`mermaid
graph LR
    X --> Y
\`\`\`

Third block with error:
\`\`\`mermaid
graph TD
    A --> B{Missing bracket
\`\`\`
`;

    await fs.writeFile(tempFile, multipleContent);

    try {
      const errors = await validateFile(tempFile);
      // 最初の2つは有効、3つ目のみエラー
      expect(errors).toHaveLength(1);
      expect(errors[0].line).toBeGreaterThan(10); // 3つ目のブロックの行番号
    } finally {
      await fs.unlink(tempFile);
    }
  }, 30000);
});