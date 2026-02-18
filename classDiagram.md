# Class Diagram: AutoCRUD.js Framework

## Major Classes

```mermaid
classDiagram
    class AutoCRUDApp {
        +init()
        +startServer()
    }

    class ConfigParser {
        -String configPath
        +loadYAML()
        +validateSchema()
        +getParsedData()
    }

    class DatabaseManager {
        <<Singleton>>
        -connectionInstance
        +connect(uri)
        +disconnect()
    }

    class ModelFactory {
        +generateMongooseSchema(config)
        +createModel(name)
    }

    class BaseController {
        <<Abstract>>
        +create(req, res)
        +read(req, res)
        +update(req, res)
        +delete(req, res)
    }

    class ControllerFactory {
        +createController(model)
    }

    class RouteGenerator {
        -expressRouter
        +bindRoutes(path, controller)
        +applyMiddleware(mw)
    }

    class ValidationMiddleware {
        +generateJoiSchema(config)
        +validate(req, res, next)
    }

    class CentralErrorHandler {
        +handle(err, req, res, next)
        +formatErrorResponse()
    }

    %% Relationships
    AutoCRUDApp --> ConfigParser : "uses"
    AutoCRUDApp --> DatabaseManager : "initializes"
    
    ConfigParser --> ModelFactory : "provides schema"
    ConfigParser --> ControllerFactory : "defines logic"
    
    ModelFactory --> DatabaseManager : "registers models"
    
    ControllerFactory --|> BaseController : "inherits/implements"
    RouteGenerator --> ControllerFactory : "maps requests"
    
    RouteGenerator --> ValidationMiddleware : "uses before controller"
    RouteGenerator --> CentralErrorHandler : "catches errors"
