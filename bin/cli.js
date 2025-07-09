#!/usr/bin/env node

import { glob } from 'glob';
import { validateFile, closeBrowser } from './validator.js';

async function main() {
  // process.argvでコマンドライン引数を取得します。
  const userArgs = process.argv.slice(2);
  if (userArgs.length === 0) {
    console.error('Error: Please specify a file pattern to validate.');
    console.error('Usage: npx md-mermaid-lint "**/*.md"');
    process.exit(1);
  }

  const files = await glob(userArgs, { ignore: 'node_modules/**' });
  let totalErrors = 0;

  if (files.length === 0) {
    console.log(`No files found matching pattern "${userArgs.join(' ')}".`);
    process.exit(0);
  }

  console.log(`Validating ${files.length} file(s)...`);

  for (const file of files) {
    const errors = await validateFile(file);
    if (errors.length > 0) {
      console.error(`\n❌ Error: ${file}`);
      errors.forEach(err => {
        // Format and display error message
        const formattedMessage = err.message.split('\n').map(line => `  ${line}`).join('\n');
        console.error(`  - Line ${err.line} Mermaid block:\n${formattedMessage}`);
      });
      totalErrors += errors.length;
    }
  }

  if (totalErrors > 0) {
    console.error(`\nTotal ${totalErrors} syntax error(s) detected.`);
    process.exit(1); // Exit with error code 1 for CI/CD
  }

  console.log('\n✅ All Mermaid diagrams are syntactically correct.');
  
  // Puppeteerブラウザのクリーンアップ
  await closeBrowser();
  process.exit(0);
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  await closeBrowser();
  process.exit(1);
});
