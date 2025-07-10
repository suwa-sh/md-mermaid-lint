import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';

let browser = null;
let browserPromise = null;

// ブラウザの初期化（シングルトン）
async function getBrowser() {
  if (browser) return browser;
  
  if (browserPromise) return browserPromise;
  
  browserPromise = puppeteer.launch({
    headless: true, // 最新のheadlessモード
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-features=VizDisplayCompositor'
    ],
    timeout: 60000 // タイムアウトを60秒に延長
  });
  
  browser = await browserPromise;
  return browser;
}

// クリーンアップ関数
export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    browserPromise = null;
  }
}

// Mermaidコードの検証
async function validateMermaidCode(code) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // ブラウザ内でMermaidを使用するHTMLを設定
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
        </head>
        <body>
          <div id="mermaid-container"></div>
        </body>
      </html>
    `, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Mermaidの初期化と検証を実行
    const result = await page.evaluate(async (mermaidCode) => {
      // Mermaidの初期化を待つ
      await new Promise(resolve => {
        if (window.mermaid) {
          window.mermaid.initialize({ 
            startOnLoad: false,
            securityLevel: 'loose'
          });
          resolve();
        } else {
          window.addEventListener('load', () => {
            window.mermaid.initialize({ 
              startOnLoad: false,
              securityLevel: 'loose'
            });
            resolve();
          });
        }
      });
      
      // parse関数を使用して検証
      try {
        const parseResult = await window.mermaid.parse(mermaidCode);
        return { success: true, result: parseResult };
      } catch (error) {
        return { 
          success: false, 
          error: {
            message: error.message || String(error),
            stack: error.stack
          }
        };
      }
    }, code);
    
    return result;
  } finally {
    await page.close();
  }
}

export async function validateFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const mermaidRegex = /```mermaid\n(.*?)\n```/gs;
  let match;
  const errors = [];

  while ((match = mermaidRegex.exec(content)) !== null) {
    const mermaidCode = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;

    const result = await validateMermaidCode(mermaidCode);
    
    if (!result.success) {
      errors.push({
        line: lineNumber,
        message: result.error.message,
      });
    }
  }
  
  return errors;
}

// プロセス終了時のクリーンアップ
process.on('exit', () => {
  if (browser) {
    browser.close();
  }
});

process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});