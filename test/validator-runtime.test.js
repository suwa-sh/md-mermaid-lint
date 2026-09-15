import { jest } from '@jest/globals';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import esmock from 'esmock';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const validatorPath = join(__dirname, '..', 'bin', 'validator.js');

describe('validator runtime', () => {
  test('Mermaidブロックを検証した場合、インストール済みMermaidバンドルが読み込まれること', async () => {
    //------------------------------
    // 準備 (Arrange)
    //------------------------------
    const addScriptTag = jest.fn().mockResolvedValue(undefined);
    const setContent = jest.fn().mockResolvedValue(undefined);
    const evaluate = jest.fn().mockResolvedValue({ success: true, result: {} });
    const closePage = jest.fn().mockResolvedValue(undefined);
    const closeMockBrowser = jest.fn().mockResolvedValue(undefined);

    const mockPage = {
      setContent,
      addScriptTag,
      evaluate,
      close: closePage,
    };

    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: closeMockBrowser,
    };

    const validatorModule = await esmock(validatorPath, {
      puppeteer: {
        default: {
          launch: jest.fn().mockResolvedValue(mockBrowser),
        },
      },
      'node:fs/promises': {
        default: {
          readFile: jest.fn().mockResolvedValue('```mermaid\ngraph TD\nA --> B\n```'),
        },
      },
    });

    //------------------------------
    // 実行 (Act)
    //------------------------------
    await validatorModule.validateFile('/tmp/test.md');
    await validatorModule.closeBrowser();

    //------------------------------
    // 検証 (Assert)
    //------------------------------
    expect(setContent).toHaveBeenCalledWith(expect.stringContaining('<!DOCTYPE html>'), expect.objectContaining({
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    }));
    expect(setContent).not.toHaveBeenCalledWith(expect.stringContaining('cdn.jsdelivr.net'));
    expect(addScriptTag).toHaveBeenCalledWith({
      path: join(__dirname, '..', 'node_modules', 'mermaid', 'dist', 'mermaid.min.js'),
    });
  });
});
