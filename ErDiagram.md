# ER Diagram: AutoCRUD.js Framework Metadata

## Entities and Attributes

### 1. User (System User/Developer)
* **user_id** (PK): Unique identifier for the developer.
* **username**: Name of the developer.
* **email**: Registered email.
* **role**: Role (Admin/Dev).

### 2. Project
* **project_id** (PK): Unique ID for each generated backend project.
* **user_id** (FK): Links to the user who created it.
* **project_name**: Name defined in YAML.
* **config_path**: Path to the YAML file.
* **created_at**: Timestamp.

### 3. Schema (Entity Definition)
* **schema_id** (PK): ID for each table/collection definition.
* **project_id** (FK): Links to the parent project.
* **table_name**: Name of the MongoDB collection.
* **definition_json**: Raw JSON storage of the YAML structure.

### 4. Api (Generated Endpoints)
* **api_id** (PK): Unique ID for each route.
* **schema_id** (FK): Links to the associated schema.
* **endpoint**: The URI path (e.g., `/api/users`).
* **method**: HTTP Verb (GET, POST, etc.).

### 5. Log (Activity/Error Tracking)
* **log_id** (PK): Unique log entry.
* **api_id** (FK): Links to the specific API that triggered the log.
* **message**: Error or success message.
* **status_code**: HTTP status code (200, 500, etc.).
* **created_at**: Timestamp.

---

## Relationships

* **User to Project**: One-to-Many (Ek user multiple projects manage kar sakta hai).
* **Project to Schema**: One-to-Many (Ek project mein multiple entities/tables ho sakti hain).
* **Schema to API**: One-to-Many (Ek schema/model ke multiple CRUD endpoints hote hain).
* **API to Log**: One-to-Many (Ek endpoint par multiple hits aur unke logs ho sakte hain).

---

## Mermaid ER Diagram

```mermaid
erDiagram
    USER ||--o{ PROJECT : manages
    PROJECT ||--o{ SCHEMA : contains
    SCHEMA ||--o{ API : generates
    API ||--o{ LOG : tracks

    USER {
        int user_id PK
        string username
        string email
        string role
    }

    PROJECT {
        int project_id PK
        int user_id FK
        string project_name
        string config_path
        datetime created_at
    }

    SCHEMA {
        int schema_id PK
        int project_id FK
        string table_name
        json fields_definition
    }

    API {
        int api_id PK
        int schema_id FK
        string endpoint
        string method
    }

    LOG {
        int log_id PK
        int api_id FK
        string message
        int status_code
        datetime created_at
    }
