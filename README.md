# AutoCRUD.js

AutoCRUD.js is a configuration-driven backend framework built with Node.js. It automates the creation of RESTful APIs by generating database models, controllers, and routes dynamically from a YAML configuration file.

## Project Goal :

The primary objective of AutoCRUD.js is to eliminate repetitive boilerplate code in backend development. By defining data structures in a centralized configuration file, developers can deploy production-ready CRUD operations without manual implementation of standard logic.

## System Architecture :-

```mermaid
graph TD
    subgraph Client_Side
        User[API Client / Postman]
    end

    subgraph Framework_Core
        Parser[YAML Config Parser]
        MF[Model Factory]
        CF[Controller Factory]
        Router[Dynamic Route Generator]
    end

    subgraph Middleware_Layer
        Val[Joi Validation]
        Sec[Security Middleware]
    end

    subgraph Database_Layer
        DB[(MongoDB / Mongoose)]
    end

    User --> Router
    Router --> Val
    Val --> CF
    CF --> MF
    MF --> DB
    Parser --> MF
    Parser --> CF
```

## System Workflow :-

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Parser as Config Engine
    participant App as Express App
    participant DB as MongoDB

    Dev->>Parser: Define entity in config.yaml
    Parser->>Parser: Parse & Validate Schema
    Parser->>DB: Initialize Mongoose Models
    Parser->>App: Inject Dynamic CRUD Routes
    App-->>Dev: Endpoints Live: /api/v1/resource
```

## Technology Stack :

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB & Mongoose |
| Validation | Joi |
| Config | YAML |

## Getting Started :-

1. Define your data models in the `config.yaml` file.
2. Initialize the framework to parse the configuration.
3. The server will dynamically register routes and models based on the definitions.

For detailed architecture, system design, and the project roadmap, please refer to idea.md.

## Developer

**Mohit Kourav ❤️**

