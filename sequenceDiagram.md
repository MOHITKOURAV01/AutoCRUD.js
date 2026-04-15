# Sequence Diagram: AutoCRUD.js Framework Lifecycle

This document provides a technical breakdown of the temporal interactions within the framework, divided into the **Boot Phase** and the **Runtime Phase**.

## 1. System Initialization (Factory Boot)
This sequence shows how the framework "manufactures" the API surface upon application startup.

```mermaid
sequenceDiagram
    participant OS as Process/Env
    participant CP as ConfigParser
    participant DB as DatabaseManager
    participant MF as ModelFactory
    participant CF as ControllerFactory
    participant RG as RouteGenerator
    participant APP as Express App

    OS->>CP: Start with CONFIG_PATH
    CP->>CP: Load & Validate YAML
    CP-->>OS: Immutable Config Object
    
    OS->>DB: getInstance().connect(URI)
    DB-->>OS: MongoDB Connection Ready
    
    OS->>MF: generateAll(entities)
    loop For each Entity
        MF->>MF: Create Mongoose Schema
        MF->>MF: Register Model in Map
    end
    
    OS->>CF: createAll(models, entities)
    loop For each Model
        CF->>CF: Instantiate BaseController
    end
    
    OS->>RG: generateRoutes(entities, controllers)
    loop For each Entity
        RG->>APP: Bind GET, POST, PUT, DELETE
    end
    
    OS->>APP: app.listen(PORT)
    Note over APP: Framework Online
```

## 2. API Request Lifecycle (The Production Line)
This sequence shows how a single REST request is processed after the framework is live.

```mermaid
sequenceDiagram
    participant Client
    participant APP as Express Gateway
    participant VM as ValidationMiddleware
    participant CTRL as BaseController
    participant MDB as MongoDB Atlas
    participant RF as ResponseFormatter

    Client->>APP: GET /api/v1/products?limit=10
    APP->>VM: validateId() [If ID present]
    APP->>VM: generateJoiSchema() [If POST/PUT]
    
    alt If Validation Fails
        VM-->>Client: 422 Unprocessable Entity
    else If Validation Passes
        VM->>CTRL: getAll(req, res)
        CTRL->>CTRL: _buildQuery(queryParams)
        CTRL->>MDB: find().limit().sort()
        MDB-->>CTRL: Document Result Set
        CTRL->>RF: success(data, message)
        RF-->>Client: 200 OK (JSON Payload)
    end
```

## Description of Interactions

### 1. Boot Logic
The framework utilizes the **Factory Pattern** extensively during boot. The `ConfigParser` acts as the single source of truth, feeding schema definitions into the `ModelFactory`, which then allows the `ControllerFactory` to prepare the business logic layer.

### 2. Runtime Pipeline
Every request passes through an automated validation gate (`ValidationMiddleware`) before reaching the `BaseController`. This ensures that the database never encounters malformed data, maintaining the integrity of the dynamically generated models.
