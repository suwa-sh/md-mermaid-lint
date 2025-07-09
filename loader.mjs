// ESMローダーフック - DOMPurifyのインポートを傍受してモックを返す
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// resolve フック - モジュール解決を傍受
export async function resolve(specifier, context, nextResolve) {
  // デバッグログ
  if (specifier.includes('dompurify') || specifier.includes('DOMPurify')) {
    console.log('Loader: Intercepting DOMPurify import:', specifier);
  }
  
  // DOMPurifyのインポートを検出
  if (specifier === 'dompurify' || specifier.includes('dompurify')) {
    // モックファイルのパスを返す
    const mockUrl = new URL('./test/mocks/dompurify.mock.js', import.meta.url).href;
    console.log('Loader: Redirecting to mock:', mockUrl);
    return {
      shortCircuit: true,
      url: mockUrl
    };
  }
  
  // その他のモジュールは通常通り解決
  return nextResolve(specifier, context);
}