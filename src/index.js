/**
 * AutoWeave Memory Module
 * Exports for hybrid memory system with mem0 and GraphRAG integration
 */

// Memory components
const HybridMemory = require('./memory/hybrid-memory');
const Mem0Client = require('./memory/mem0-client');
const GraphClient = require('./memory/graph-client');

// Cache components
const RedisMlCache = require('./cache/redis-ml-cache');

module.exports = {
  // Main hybrid memory system
  HybridMemory,
  
  // Individual memory clients
  Mem0Client,
  GraphClient,
  
  // Caching layer
  RedisMlCache,
  
  // Factory method for creating a configured hybrid memory instance
  createMemorySystem: (config = {}) => {
    return new HybridMemory({
      mem0Config: {
        selfHosted: config.mem0SelfHosted || process.env.MEM0_SELF_HOSTED === 'true',
        apiKey: config.mem0ApiKey || process.env.MEM0_API_KEY,
        userId: config.userId || 'system',
        qdrantHost: config.qdrantHost || process.env.QDRANT_HOST || 'localhost',
        qdrantPort: config.qdrantPort || process.env.QDRANT_PORT || 6333,
        ...config.mem0Config
      },
      graphConfig: {
        host: config.memgraphHost || process.env.MEMGRAPH_HOST || 'localhost',
        port: config.memgraphPort || process.env.MEMGRAPH_PORT || 7687,
        ...config.graphConfig
      },
      cacheConfig: {
        host: config.redisHost || process.env.REDIS_HOST || 'localhost',
        port: config.redisPort || process.env.REDIS_PORT || 6379,
        ...config.cacheConfig
      }
    });
  }
};