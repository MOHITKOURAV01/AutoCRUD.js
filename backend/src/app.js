import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Core Framework Imports
import ConfigParser from './core/ConfigParser.js';
import DatabaseManager from './core/DatabaseManager.js';
import ModelFactory from './core/ModelFactory.js';
import ControllerFactory from './core/ControllerFactory.js';
import RouteGenerator from './core/RouteGenerator.js';

// Middleware & Utilities
import Logger from './middleware/Logger.js';
import ErrorHandler from './middleware/ErrorHandler.js';
import ResponseFormatter from './utils/ResponseFormatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * Main application bootstrapper.
 */
async function main() {
  try {
    // 1. Initialise Utilities
    app.use(helmet());
    
    // Dynamic CORS Configuration
    const allowedOrigins = [
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    app.use(cors({
      origin: allowedOrigins,
      credentials: true
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(Logger.requestLogger);

    // 2. Parse YAML Configuration
    const configPath = process.env.CONFIG_PATH || path.join(__dirname, 'config', 'sample.config.yaml');
    const parser = new ConfigParser(configPath);
    const config = parser.loadYAML();

    // 3. Connect to Database (Singleton)
    const dbManager = DatabaseManager.getInstance();
    await dbManager.connect(process.env.MONGODB_URI);

    // 4. Generate Core Logic
    // Step A: Manufacture Mongoose Models
    ModelFactory.generateAll(config.entities);
    const models = ModelFactory.getAllModels();

    // Step B: Instantiate Controllers
    const controllersMap = ControllerFactory.createAll(new Map(Object.entries(models)), config.entities);

    // Step C: Generate & Bind Routes
    const routeGenerator = new RouteGenerator(app);
    routeGenerator.generateRoutes(config.entities, controllersMap, new Map(Object.entries(models)));

    // 5. Meta Endpoints
    app.get('/api/v1/health', (req, res) => {
      ResponseFormatter.success(res, {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        entities: config.entities.map(e => e.name)
      }, 200, 'Framework is healthy');
    });

    app.get('/api/v1/routes', (req, res) => {
      ResponseFormatter.success(res, routeGenerator.getRegisteredRoutes());
    });

    // 6. Global Error Handling (Last)
    app.use(ErrorHandler);

    // 7. Start Listening
    const PORT = process.env.PORT || config.project.port || 5000;
    app.listen(PORT, () => {
      printBanner(config, PORT);
    });

  } catch (error) {
    Logger.error(`Failed to boot AutoCRUD.js: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Displays a professional ASCII banner on framework startup.
 */
function printBanner(config, port) {
  const banner = `
   ▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄  ▄Refactored      
  █      █       █   █       █       █      █ █▄ 
  █  ▄   █   ▄   █   █   ▄   █   ▄   █  ▄    █  █
  █ █▄█  █  █ █  █   █  █ █  █  █ █  █ █ █   █  █
  █      █  █▄█  █   █  █▄█  █  █▄█  █ █▄█   █  █
  █  ▄   █       █   █       █       █       █  █
  █▄█ █▄▄█▄▄▄▄▄▄▄█▄▄▄█▄▄▄▄▄▄▄█▄▄▄▄▄▄▄█▄▄▄▄▄▄█▄▄▄█
  
  🚀 ${config.project.name} v${config.project.version}
  📡 Listening on port: ${port}
  📦 Entities Loaded: ${config.entities.length}
  🛡️ Security: Helmet + Rate Limiting Enabled
  ✨ Status: Ready to serve CRUD operations
  `;
  console.log(banner);
}

// 8. Handle Global Process Errors
process.on('unhandledRejection', (reason, promise) => {
  Logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  Logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run the engine
main();

export default app;
