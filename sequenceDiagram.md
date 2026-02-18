
# Sequence Diagram: API Generation Flow

## Main Flow: Generate CRUD APIs...

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CLI as CLI Tool
    participant Core as AutoCRUD Core
    participant DB as Database

    Dev->>CLI: Provide YAML Config
    CLI->>Core: Parse Config
    Core->>Core: Generate Models
    Core->>Core: Generate Controllers
    Core->>Core: Generate Routes
    Core->>DB: Connect Database
    DB-->>Core: Connected
    Core-->>CLI: APIs Generated
    CLI-->>Dev: Success Message
