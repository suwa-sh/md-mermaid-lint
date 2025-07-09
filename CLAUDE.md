# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`md-mermaid-lint` は、Markdown ファイル内の Mermaid 図の構文を検証する CLI ツールです。CI/CD パイプラインやドキュメント生成前の構文エラー検出に使用されます。

## 主要コマンド

### 開発・テスト

```bash
# 依存関係のインストール
npm install

# CLIツールのテスト実行（例）
node bin/cli.js "**/*.md"

# パッケージのローカルテスト
npm link
md-mermaid-lint "test/*.md"
```

### パッケージ公開

```bash
# npmへの公開
npm publish

# バージョン更新
npm version patch  # または minor, major
```

## アーキテクチャ

### 技術スタック
- **実行環境**: Node.js (ESモジュール使用)
- **主要依存関係**:
  - `mermaid`: Mermaid 図の構文解析
  - `jsdom`: Node.js 環境での仮想 DOM 提供
  - `glob`: ファイルパターンマッチング
  - `dompurify`: セキュリティ用（Mermaid の要求）

### コード構造
- **bin/cli.js**: メインの実行ファイル
  - JSDOM を使用して仮想ブラウザ環境を構築
  - `mermaid.parse()` API で各 Mermaid ブロックの構文を検証
  - エラー時は非ゼロの終了コードを返す（CI/CD 対応）

### 処理フロー
1. glob パターンで Markdown ファイルを検索
2. 各ファイルから ```mermaid ブロックを正規表現で抽出
3. `mermaid.parse()` で構文検証
4. エラーの場合、ファイル名と行番号付きで報告

### 重要な実装詳細
- グローバルオブジェクトの設定（window, document 等）は Mermaid がブラウザ環境を前提としているため必須
- `securityLevel: 'strict'` で Mermaid を初期化
- エラーメッセージは英語で出力される仕様


## テストコードのルール

テストコードは以下のルールに従って作成してください

### テストメソッド命名規則

テスト名と内容はBDDに倣って、「〜の場合、〜であること」という形式で、ビジネス要件を明確に表現してください。

```
test_{対象機能}_{テスト条件}_{期待結果}であること
```

**例：**

```python
def test_models_endpoint_GETリクエストを送信した場合_claude_sonnet_4だけが返されること(self, server_process):
def test_chat_completion_正常なチャットリクエストを送信した場合_回答が得られること(self, server_process, client):
def test_chat_completion_チャットリクエストで無効なAPIキーでリクエストを送信した場合_例外が発生すること(self, server_process):
```

### AAAパターンの実装

すべてのテストメソッドは以下の3つのセクションに明確に分割してください：

- **準備 (Arrange)**: テストに必要なデータ、オブジェクト、モックを設定
- **実行 (Act)**: テスト対象の機能を実行（1つの操作に集中）
- **検証 (Assert)**: 期待される結果と実際の結果を比較・検証

```python
def test_example_テスト条件_期待結果であること(self, fixtures):
    #------------------------------
    # 準備 (Arrange)
    #------------------------------
    # テストデータの設定、モックの準備など

    #------------------------------
    # 実行 (Act)
    #------------------------------
    # テスト対象の機能を実行

    #------------------------------
    # 検証 (Assert)
    #------------------------------
    # 結果の検証とアサーション
```

### テストケースの焦点

- 各テストメソッドは1つの具体的なシナリオに集中する
- 複雑な並行処理や複数の条件を組み合わせたテストは避ける
- 基本的な動作確認を重視し、エッジケースは別のテストで扱う
