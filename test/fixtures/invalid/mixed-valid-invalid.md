# Mixed Valid and Invalid Diagrams

This document contains both valid and invalid Mermaid diagrams.

## Valid Diagram

```mermaid
graph LR
    A[Start] --> B[Process]
    B --> C[End]
```

## Invalid Diagram

```mermaid
flowchart TB
    A[Start] --> B{Decision
    B -->|Yes| C[Result 1]
    B -->|No| D[Result 2]
    C --> E[End]
    D --> E
```

## Another Valid Diagram

```mermaid
pie title Sample Pie Chart
    "Category A" : 30
    "Category B" : 45
    "Category C" : 25
```

## Another Invalid Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound(
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
```

Mixed content with both valid and invalid diagrams.