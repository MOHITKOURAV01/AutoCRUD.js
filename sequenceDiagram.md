
# Sequence Diagram: API Generation Flow

## Main Flow: Generate CRUD APIs...

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer (YAML)
    participant Parser as ConfigParser
    participant MF as ModelFactory
    participant CF as ControllerFactory
    participant Router as RouteGenerator
    participant DB as MongoDB (Persistence)

    Note over Dev, DB: Phase 1: Configuration & Initialization
    Dev->>Parser: Provide 'config.yaml' (Schemas/Rules)
    Parser->>Parser: Validate YAML Syntax & Schema
    
    Parser->>DB: Init Singleton Connection
    DB-->>Parser: Connection Established

    Note over Parser, CF: Phase 2: Dynamic Resource Generation
    Parser->>MF: Send Entity Definitions
    MF->>MF: Map YAML types to Mongoose Schemas
    MF->>DB: Register Dynamic Models

    Parser->>CF: Send Business Rules
    CF->>CF: Instantiate BaseController Methods
    CF->>CF: Attach Joi Validation Logic

    Note over CF, Router: Phase 3: Routing & Server Boot
    CF->>Router: Inject Controllers & Middleware
    Router->>Router: Map HTTP Methods (GET, POST, etc.)
    Router-->>Dev: API Endpoints Ready (Server Live)
