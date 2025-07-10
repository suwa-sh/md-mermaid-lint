import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = join(__dirname, '..', 'bin', 'cli.js');

function runCLI(args = []) {
  return new Promise((resolve) => {
    const child = spawn('node', [cliPath, ...args], {
      cwd: __dirname,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

describe('md-mermaid-lint CLI', () => {
  describe('引数なしで実行した場合', () => {
    test('md-mermaid-lint_引数なしで実行した場合_エラーメッセージが表示されて終了コード1で終了すること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      // 引数なし

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI();

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Error: Please specify a file pattern to validate.');
      expect(result.stderr).toContain('Usage: npx md-mermaid-lint "**/*.md"');
    }, 30000);
  });

  describe('存在しないパターンを指定した場合', () => {
    test('md-mermaid-lint_存在しないパターンを指定した場合_ファイルが見つからないメッセージが表示されて終了コード0で終了すること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const nonExistentPattern = 'non-existent-pattern-*.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([nonExistentPattern]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(0);
      expect(result.stdout).toContain(`No files found matching pattern "${nonExistentPattern}".`);
    }, 30000);
  });

  describe('正常系：有効なMermaid図を含むファイル', () => {
    test('md-mermaid-lint_単純なフローチャートを含むファイルを検証した場合_エラーなく成功すること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const validFile = 'fixtures/valid/simple-flowchart.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([validFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Validating 1 file(s)...');
      expect(result.stdout).toContain('✅ All Mermaid diagrams are syntactically correct.');
      expect(result.stderr).not.toContain('❌ Error:');
    }, 30000);

    test('md-mermaid-lint_複数の有効なMermaid図を含むファイルを検証した場合_エラーなく成功すること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const multipleValidFile = 'fixtures/valid/multiple-diagrams.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([multipleValidFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('✅ All Mermaid diagrams are syntactically correct.');
      expect(result.stderr).not.toContain('❌ Error:');
    }, 30000);

    test('md-mermaid-lint_複雑なMermaid図を含むファイルを検証した場合_エラーなく成功すること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const complexFile = 'fixtures/valid/complex-diagrams.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([complexFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('✅ All Mermaid diagrams are syntactically correct.');
    }, 60000);

    test('md-mermaid-lint_複数の有効なファイルをワイルドカードで検証した場合_全てのファイルが正常に検証されること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const pattern = 'fixtures/valid/*.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([pattern]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Validating 3 file(s)...');
      expect(result.stdout).toContain('✅ All Mermaid diagrams are syntactically correct.');
    }, 30000);
  });

  describe('異常系：構文エラーを含むファイル', () => {
    test('md-mermaid-lint_構文エラーを含むファイルを検証した場合_エラーが報告されて終了コード1で終了すること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const invalidFile = 'fixtures/invalid/syntax-error.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([invalidFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('❌ Error: fixtures/invalid/syntax-error.md');
      expect(result.stderr).toContain('Line 5 Mermaid block:');
      expect(result.stderr).toContain('Total 1 syntax error(s) detected.');
    }, 30000);

    test('md-mermaid-lint_複数のエラーを含むファイルを検証した場合_全てのエラーが報告されること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const multipleErrorsFile = 'fixtures/invalid/multiple-errors.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([multipleErrorsFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('❌ Error: fixtures/invalid/multiple-errors.md');
      expect(result.stderr).toContain('Total 2 syntax error(s) detected.');
    }, 30000);

    test('md-mermaid-lint_有効と無効なMermaid図が混在するファイルを検証した場合_無効な図のみエラーが報告されること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const mixedFile = 'fixtures/invalid/mixed-valid-invalid.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([mixedFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('❌ Error: fixtures/invalid/mixed-valid-invalid.md');
      expect(result.stderr).toContain('Line 15 Mermaid block:');
      expect(result.stderr).toContain('Total 1 syntax error(s) detected.');
    }, 30000);
  });

  describe('エッジケース', () => {
    test('md-mermaid-lint_空のファイルを検証した場合_エラーなく成功すること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const emptyFile = 'fixtures/edge-cases/empty-file.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([emptyFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('✅ All Mermaid diagrams are syntactically correct.');
    }, 30000);

    test('md-mermaid-lint_Mermaid図を含まないファイルを検証した場合_エラーなく成功すること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const noMermaidFile = 'fixtures/edge-cases/no-mermaid.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([noMermaidFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('✅ All Mermaid diagrams are syntactically correct.');
    }, 30000);

    test('md-mermaid-lint_不正な形式のコードブロックを含むファイルを検証した場合_適切に処理されること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const malformedFile = 'fixtures/edge-cases/malformed-blocks.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([malformedFile]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      // 空のMermaidブロックやコメントのみのブロックはエラーになる
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('❌ Error: fixtures/edge-cases/malformed-blocks.md');
    }, 30000);
  });

  describe('複数ファイルの検証', () => {
    test('md-mermaid-lint_有効と無効なファイルを同時に検証した場合_無効なファイルのみエラーが報告されること', async () => {
      //------------------------------
      // 準備 (Arrange)
      //------------------------------
      const pattern = 'fixtures/**/*.md';

      //------------------------------
      // 実行 (Act)
      //------------------------------
      const result = await runCLI([pattern]);

      //------------------------------
      // 検証 (Assert)
      //------------------------------
      expect(result.code).toBe(1);
      expect(result.stdout).toContain('Validating 9 file(s)...');
      expect(result.stderr).toContain('❌ Error: fixtures/invalid/syntax-error.md');
      expect(result.stderr).toContain('❌ Error: fixtures/invalid/multiple-errors.md');
      expect(result.stderr).toContain('❌ Error: fixtures/invalid/mixed-valid-invalid.md');
      expect(result.stderr).toContain('Total 7 syntax error(s) detected.');
    }, 60000);
  });
});