# Malformed Code Blocks

This document contains edge cases with malformed Mermaid blocks.

## Empty Mermaid Block

```mermaid
```

## Mermaid Block with Only Whitespace

```mermaid


```

## Mermaid Block with Comment Only

```mermaid
%% This is just a comment
```

## Inline Code (Should be ignored)

This is `mermaid graph TD` inline code, not a block.

## Mermaid Without Closing

```mermaid
graph TD
    A --> B

This block is not properly closed.

## Nested Code Blocks (Edge case)

````markdown
```mermaid
graph TD
    A --> B
```
````

End of document.