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

## Docker Usage

You can also run `md-mermaid-lint` using Docker. This is useful for CI/CD environments or when you don't want to install Node.js dependencies locally.

### Using GitHub Container Registry

Pull and run the latest version directly from GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/suwa-sh/md-mermaid-lint:latest

# Run the linter on your markdown files
docker run --rm -v $(pwd):/workspace ghcr.io/suwa-sh/md-mermaid-lint:latest "*.md"
```

### Building Locally

Build and run the Docker image locally:

```bash
# Build the image
docker build -t md-mermaid-lint .

# Run the linter
docker run --rm -v $(pwd):/workspace md-mermaid-lint "*.md"
```

### Using docker-compose

For convenience, you can use docker-compose:

```bash
# Run with docker-compose (checks files in ./test directory by default)
docker-compose run --rm md-mermaid-lint

# Or specify a different pattern
docker-compose run --rm md-mermaid-lint "docs/**/*.md"
```

### CI/CD Integration Example

Here's an example of using the Docker image in a GitHub Actions workflow:

```yaml
name: Validate Mermaid Diagrams

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate Mermaid syntax
        run: |
          docker run --rm -v ${{ github.workspace }}:/workspace \
            ghcr.io/suwa-sh/md-mermaid-lint:latest "**/*.md"
```

## License

MIT
