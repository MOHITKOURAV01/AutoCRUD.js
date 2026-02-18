# Use Case Diagram: AutoCRUD.js Framework

## Actors
- Developer
- System Admin

## Use Cases

### Developer
- Configure YAML File
- Generate APIs
- Manage Models
- Manage Controllers
- Test APIs
- View Logs

### System Admin
- Monitor System
- Manage Security
- Update Framework

---

## Mermaid Diagram

```mermaid
graph LR
    %% Actors Definition
    Dev((Developer))
    Admin((System Admin))

    subgraph "AutoCRUD.js Framework Boundary"
        %% Developer Use Cases
        UC1(Configure YAML Schema)
        UC2(Auto-Generate CRUD APIs)
        UC3(Manage Models & Controllers)
        UC4(Test REST Endpoints)
        UC5(Analyze System Logs)

        %% Admin Use Cases
        UC6(Monitor Framework Health)
        UC7(Configure Security Middleware)
        UC8(Perform Framework Updates)

        %% Relationships within System
        UC1 -.->|triggers| UC2
        UC2 -.->|includes| UC3
    end

    %% Actor Interactions
    Dev --- UC1
    Dev --- UC2
    Dev --- UC4
    Dev --- UC5

    Admin --- UC6
    Admin --- UC7
    Admin --- UC8
