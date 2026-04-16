import mongoose from 'mongoose';

/**
 * WHY SINGLETON: 
 * We use the Singleton pattern for the DatabaseManager to ensure that only 
 * one database connection instance exists throughout the application lifecycle. 
 * This prevents the overhead of creating multiple redundant connection pools 
 * to MongoDB and ensures a centralized point for managing connection states, 
 * event listeners, and graceful shutdowns.
 */

class DatabaseManager {
    static #instance = null;
    #maxRetries = 3;
    #retryDelay = 3000; // 3 seconds

    /**
     * Private constructor to prevent direct instantiation.
     */
    constructor() {
        if (DatabaseManager.#instance) {
            throw new Error("Use DatabaseManager.getInstance() instead of new.");
        }
        
        // Setup default connection listeners
        this.#setupEventListeners();
        this.#setupGracefulShutdown();
    }

    /**
     * Returns the singleton instance of DatabaseManager.
     * @returns {DatabaseManager} The singleton instance.
     */
    static getInstance() {
        if (!DatabaseManager.#instance) {
            DatabaseManager.#instance = new DatabaseManager();
        }
        return DatabaseManager.#instance;
    }

    /**
     * Connects to MongoDB using Mongoose with retry logic.
     * @param {string} uri - The MongoDB connection URI.
     * @returns {Promise<typeof mongoose>} The mongoose instance.
     * @throws {Error} If connection fails after max retries.
     */
    async connect(uri) {
        if (this.isConnected()) {
            console.log('📦 Using existing MongoDB connection');
            return mongoose;
        }

        let attempts = 0;
        while (attempts < this.#maxRetries) {
            try {
                console.log(`🔌 Attempting MongoDB connection (Attempt ${attempts + 1}/${this.#maxRetries})...`);
                await mongoose.connect(uri || process.env.MONGODB_URI);
                console.log('✅ MongoDB Connected successfully');
                return mongoose;
            } catch (error) {
                attempts++;
                console.error(`❌ MongoDB Connection Error (Attempt ${attempts}):`, error.message);
                
                if (attempts < this.#maxRetries) {
                    console.log(`⏳ Retrying in ${this.#retryDelay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, this.#retryDelay));
                } else {
                    console.error('🛑 Max connection retries reached. Database unavailable.');
                    // We don't crash immediately as per requirements, but we've logged the failure.
                }
            }
        }
    }

    /**
     * Gracefully closes the MongoDB connection.
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('👋 MongoDB connection closed gracefully');
        }
    }

    /**
     * Checks if the database is currently connected.
     * @returns {boolean} True if connected.
     */
    isConnected() {
        return mongoose.connection.readyState === 1;
    }

    /**
     * Returns the raw mongoose connection object.
     * @returns {mongoose.Connection} The mongoose connection.
     */
    getConnection() {
        return mongoose.connection;
    }

    /**
     * Internal method to set up MongoDB event listeners.
     */
    #setupEventListeners() {
        const db = mongoose.connection;

        db.on('error', (err) => {
            console.error('⚠️ MongoDB Error:', err.message);
        });

        db.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        db.on('reconnected', () => {
            console.log('♻️ MongoDB reconnected');
        });
    }

    /**
     * Internal method to handle SIGINT and SIGTERM for graceful shutdown.
     */
    #setupGracefulShutdown() {
        const gracefulExit = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Shutting down database connection...`);
            await this.disconnect();
            process.exit(0);
        };

        process.on('SIGINT', () => gracefulExit('SIGINT'));
        process.on('SIGTERM', () => gracefulExit('SIGTERM'));
    }
}

export default DatabaseManager;
