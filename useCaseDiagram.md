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
graph TD
    Developer --> Configure
    Developer --> Generate
    Developer --> Test
    Developer --> Logs

    Admin --> Monitor
    Admin --> Security
    Admin --> Update

    Configure --> Generate
