/**
 * AutoWeave Memory Module
 * Main entry point for the hybrid memory system
 */

const express = require('express');
const bodyParser = require('body-parser');
const { HybridMemoryManager } = require('./memory/hybrid-memory');
const { Logger } = require('./utils/logger');
require('dotenv').config();

const app = express();
const logger = new Logger('MemoryService');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Initialize memory manager
let memoryManager;

async function initializeMemory() {
    logger.info('Initializing AutoWeave Memory System...');
    
    const config = {
        mem0: {
            apiKey: process.env.OPENAI_API_KEY,
            host: process.env.QDRANT_HOST || 'localhost',
            port: parseInt(process.env.QDRANT_PORT) || 6333,
            https: process.env.QDRANT_HTTPS === 'true',
            collectionName: process.env.MEMORY_COLLECTION_NAME || 'autoweave_memories'
        },
        graph: {
            host: process.env.MEMGRAPH_HOST || 'localhost',
            port: parseInt(process.env.MEMGRAPH_PORT) || 7687,
            user: process.env.MEMGRAPH_USER,
            password: process.env.MEMGRAPH_PASSWORD
        },
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB) || 0
        },
        hybrid: {
            contextualWeight: parseFloat(process.env.HYBRID_CONTEXTUAL_WEIGHT) || 0.7,
            structuralWeight: parseFloat(process.env.HYBRID_STRUCTURAL_WEIGHT) || 0.3,
            minScore: parseFloat(process.env.HYBRID_MIN_SCORE) || 0.5
        }
    };
    
    memoryManager = new HybridMemoryManager(config);
    await memoryManager.initialize();
    
    logger.success('Memory system initialized successfully');
}

// Routes

// Health check
app.get('/health', async (req, res) => {
    try {
        const health = await memoryManager.getSystemHealth();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            components: health
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Store memory
app.post('/api/memory/store', async (req, res) => {
    try {
        const { userId, agentId, content, metadata } = req.body;
        
        if (!userId || !content) {
            return res.status(400).json({
                error: 'userId and content are required'
            });
        }
        
        const result = await memoryManager.store({
            userId,
            agentId,
            content,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        });
        
        res.json({
            success: true,
            memoryId: result.id,
            message: 'Memory stored successfully'
        });
    } catch (error) {
        logger.error('Failed to store memory:', error);
        res.status(500).json({
            error: 'Failed to store memory',
            details: error.message
        });
    }
});

// Search memories
app.post('/api/memory/search', async (req, res) => {
    try {
        const { query, userId, agentId, limit = 10, hybrid = true } = req.body;
        
        if (!query) {
            return res.status(400).json({
                error: 'query is required'
            });
        }
        
        const results = await memoryManager.search({
            query,
            userId,
            agentId,
            limit,
            hybrid
        });
        
        res.json({
            success: true,
            count: results.length,
            results
        });
    } catch (error) {
        logger.error('Search failed:', error);
        res.status(500).json({
            error: 'Search failed',
            details: error.message
        });
    }
});

// Add relationship
app.post('/api/memory/relationship', async (req, res) => {
    try {
        const { from, to, relationship, properties } = req.body;
        
        if (!from || !to || !relationship) {
            return res.status(400).json({
                error: 'from, to, and relationship are required'
            });
        }
        
        const result = await memoryManager.addRelationship({
            from,
            to,
            relationship,
            properties
        });
        
        res.json({
            success: true,
            relationshipId: result.id
        });
    } catch (error) {
        logger.error('Failed to add relationship:', error);
        res.status(500).json({
            error: 'Failed to add relationship',
            details: error.message
        });
    }
});

// Get metrics
app.get('/api/memory/metrics', async (req, res) => {
    try {
        const metrics = await memoryManager.getMetrics();
        res.json(metrics);
    } catch (error) {
        logger.error('Failed to get metrics:', error);
        res.status(500).json({
            error: 'Failed to get metrics',
            details: error.message
        });
    }
});

// Get system topology
app.get('/api/memory/topology', async (req, res) => {
    try {
        const topology = await memoryManager.getSystemTopology();
        res.json(topology);
    } catch (error) {
        logger.error('Failed to get topology:', error);
        res.status(500).json({
            error: 'Failed to get topology',
            details: error.message
        });
    }
});

// Batch operations
app.post('/api/memory/batch/store', async (req, res) => {
    try {
        const { memories } = req.body;
        
        if (!Array.isArray(memories) || memories.length === 0) {
            return res.status(400).json({
                error: 'memories array is required and must not be empty'
            });
        }
        
        const results = await memoryManager.batchStore(memories);
        
        res.json({
            success: true,
            stored: results.length,
            results
        });
    } catch (error) {
        logger.error('Batch store failed:', error);
        res.status(500).json({
            error: 'Batch store failed',
            details: error.message
        });
    }
});

// Clear user memories (with confirmation)
app.delete('/api/memory/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { confirm } = req.query;
        
        if (confirm !== 'true') {
            return res.status(400).json({
                error: 'Please confirm deletion by adding ?confirm=true'
            });
        }
        
        const result = await memoryManager.clearUserMemories(userId);
        
        res.json({
            success: true,
            message: `Cleared memories for user ${userId}`,
            deletedCount: result.count
        });
    } catch (error) {
        logger.error('Failed to clear memories:', error);
        res.status(500).json({
            error: 'Failed to clear memories',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
async function startServer() {
    try {
        await initializeMemory();
        
        app.listen(PORT, () => {
            logger.success(`AutoWeave Memory Service running on port ${PORT}`);
            logger.info('Endpoints:');
            logger.info(`  - Health: http://localhost:${PORT}/health`);
            logger.info(`  - Store: POST http://localhost:${PORT}/api/memory/store`);
            logger.info(`  - Search: POST http://localhost:${PORT}/api/memory/search`);
            logger.info(`  - Metrics: GET http://localhost:${PORT}/api/memory/metrics`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    if (memoryManager) {
        await memoryManager.shutdown();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    if (memoryManager) {
        await memoryManager.shutdown();
    }
    process.exit(0);
});

// Start the server
startServer();

// Export for testing
module.exports = { app, memoryManager };