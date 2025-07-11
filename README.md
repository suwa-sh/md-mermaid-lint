# md-mermaid-lint

A simple command-line tool to validate Mermaid syntax within your Markdown files. It helps you catch syntax errors before they break your documentation rendering in CI/CD pipelines or on static site generators.

## Features

- Scans Markdown files using glob patterns.
- Extracts all ` ```mermaid ... ``` ` code blocks.
- Validates the syntax of each block using the official `mermaid` library.
- Reports errors with the file name and the line number of the faulty block.
- Exits with a non-zero status code if any error is found, making it ideal for CI/CD integration.

## Install

```bash
npm i -g md-mermaid-lint
```

## Usage

You can run this tool directly using `npx` without a global installation.

```bash
md-mermaid-lint "path/to/your/docs/**/*.md"
```

### Examples

Check all Markdown files in the current directory and its subdirectories:
```bash
md-mermaid-lint "**/*.md"
```

Check only files in the `docs/` directory:
```bash
md-mermaid-lint "docs/*.md"
```

## How It Works

This tool programmatically uses the `mermaid.parse()` API to attempt to parse every Mermaid diagram it finds. If the parse fails, it catches the error and reports it to you. To run in a Node.js environment, it simulates a browser DOM using `jsdom`.

## License

MIT
