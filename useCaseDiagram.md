# Use Case Diagram: AutoCRUD.js Framework

The following diagram illustrates the functional requirements of the AutoCRUD.js framework from the perspective of different stakeholders.

## Actors
- **Developer**: Architect of the system who defines schemas and monitors the framework.
- **API Consumer**: Client applications or developers using the generated REST surface.
- **System**: The AutoCRUD core engine that orchestrates the automation pipeline.

## Mermaid Use Case Diagram

```mermaid
graph LR
    Dev((Developer))
    Consumer((API Consumer))
    System{AutoCRUD Engine}

    subgraph Administration_Context
        UC1[Configure YAML Schema]
        UC2[Monitor System Health]
        UC3[View Live Logs]
        UC4[Manage Deployment]
    end

    subgraph Operation_Context
        UC5[Generate Dynamic APIs]
        UC6[Validate Request Data]
        UC7[Test Endpoints]
        UC8[Perform CRUD Actions]
    end

    Dev --> UC1
    Dev --> UC2
    Dev --> UC3
    Dev --> UC4

    Consumer --> UC7
    Consumer --> UC8

    System --> UC5
    System --> UC6

    %% Relationships
    UC5 -.-> |includes| UC1
    UC2 -.-> |extends| UC3
    UC8 -.-> |includes| UC6
```

## Description of Use Cases

### 1. Configure YAML Schema
The Developer provides a structural definition of entities. This is the primary trigger for the entire framework lifecycle.

### 2. Generate Dynamic APIs
The System consumes the YAML and "manufactures" Mongoose models, Express controllers, and RESTful routes without manual coding.

### 3. Monitor System Health
The Developer checks the `/health` and `/routes` discovery endpoints to ensure the factory is operating within normal parameters.

### 4. Test Endpoints
The API Consumer uses the interactive **Explorer** to simulate requests and verify the generated logic against real-world data.

### 5. Validate Request Data
The System automatically applies Joi validation rules derived from the YAML field definitions before allowing any data to reach the database.
