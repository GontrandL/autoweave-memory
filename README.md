# AutoWeave Memory Module

A sophisticated hybrid memory system for AutoWeave that combines contextual memory (mem0) with structural memory (GraphRAG) for intelligent agent orchestration.

## Overview

AutoWeave Memory provides:
- **Contextual Memory**: Personal, session-based memory using mem0 with Qdrant vector store
- **Structural Memory**: Relationship-based memory using Memgraph graph database
- **ML Cache**: Redis with RedisSearch/RedisJSON for intelligent caching
- **Hybrid Search**: Fusion algorithm combining vector and graph search results

## Architecture

```
┌─────────────────────┐
│   AutoWeave Core    │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Hybrid Memory API  │
├─────────────────────┤
│  - Search           │
│  - Store            │
│  - Relationships    │
└──────────┬──────────┘
           │
     ┌─────┴─────┬────────────┐
     │           │            │
┌────▼────┐ ┌───▼────┐ ┌─────▼─────┐
│  mem0   │ │GraphRAG│ │Redis Cache│
│ (Qdrant)│ │(Memgraph)│ │  (ML)    │
└─────────┘ └────────┘ └───────────┘
```

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/gontrand-hub/autoweave-memory.git
cd autoweave-memory

# Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

### Manual Installation

```bash
# Install Node.js dependencies
npm install

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run setup script
./scripts/setup-memory-system.sh

# Start services individually
node src/index.js  # Main memory service
python scripts/mem0-bridge.py serve  # mem0 bridge
```

## Components

### 1. Hybrid Memory Manager (`src/memory/hybrid-memory.js`)
Main orchestrator that combines contextual and structural memory:
- Intelligent search fusion
- Performance optimization with ML cache
- Automatic relationship extraction
- Session management

### 2. mem0 Client (`src/memory/mem0-client.js`)
Handles contextual memory operations:
- Vector embeddings with OpenAI
- Similarity search with Qdrant
- User/agent context management
- Conversation history

### 3. Graph Client (`src/memory/graph-client.js`)
Manages structural relationships:
- Agent dependency graphs
- Knowledge graphs
- Workflow relationships
- Pattern detection

### 4. Redis ML Cache (`src/cache/redis-ml-cache.js`)
Intelligent caching layer:
- Embedding cache
- Search result cache
- Pattern-based invalidation
- ML-powered optimization

### 5. mem0 Bridge (`scripts/mem0-bridge.py`)
Python bridge for self-hosted mem0:
- FastAPI server
- Async operations
- Health monitoring
- Batch processing

## API Usage

### JavaScript/Node.js

```javascript
const { HybridMemoryManager } = require('autoweave-memory');

// Initialize
const memory = new HybridMemoryManager({
    mem0: {
        apiKey: process.env.OPENAI_API_KEY,
        qdrantHost: 'localhost',
        qdrantPort: 6333
    },
    graph: {
        host: 'localhost',
        port: 7687
    },
    redis: {
        host: 'localhost',
        port: 6379
    }
});

await memory.initialize();

// Store memory
await memory.store({
    userId: 'user123',
    agentId: 'agent456',
    content: 'User requested a file processing agent',
    metadata: {
        timestamp: new Date(),
        context: 'agent-creation'
    }
});

// Search memories
const results = await memory.search({
    query: 'file processing',
    userId: 'user123',
    limit: 10,
    hybrid: true  // Use both contextual and structural search
});

// Add relationships
await memory.addRelationship({
    from: { type: 'agent', id: 'agent456' },
    to: { type: 'tool', id: 'file-reader' },
    relationship: 'USES'
});
```

### REST API

```bash
# Health check
curl http://localhost:3000/health

# Store memory
curl -X POST http://localhost:3000/api/memory/store \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "content": "Create a monitoring dashboard",
    "metadata": {"context": "request"}
  }'

# Search memories
curl -X POST http://localhost:3000/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "monitoring",
    "userId": "user123",
    "limit": 10
  }'

# Get system metrics
curl http://localhost:3000/api/memory/metrics
```

### Python Bridge

```python
import asyncio
from mem0_bridge import Mem0Bridge

# Initialize bridge
bridge = Mem0Bridge(
    qdrant_host="localhost",
    memgraph_host="localhost"
)

# Store memory
await bridge.store_memory(
    user_id="user123",
    content="User preferences for data visualization",
    metadata={"category": "preferences"}
)

# Search
results = await bridge.search(
    query="data visualization",
    user_id="user123"
)
```

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your-api-key

# Qdrant Configuration
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=optional-api-key

# Memgraph Configuration
MEMGRAPH_HOST=localhost
MEMGRAPH_PORT=7687
MEMGRAPH_USER=optional-user
MEMGRAPH_PASSWORD=optional-password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional-password

# Service Configuration
MEM0_BRIDGE_PORT=8090
LOG_LEVEL=INFO
NODE_ENV=production
```

### Memory System Configuration

```javascript
const config = {
    // Contextual memory settings
    mem0: {
        collectionName: 'autoweave_memories',
        embeddingModel: 'text-embedding-ada-002',
        chunkSize: 1000,
        chunkOverlap: 200
    },
    
    // Graph memory settings
    graph: {
        maxDepth: 3,
        relationshipTypes: ['USES', 'DEPENDS_ON', 'CREATES', 'MONITORS'],
        indexedProperties: ['name', 'type', 'category']
    },
    
    // Cache settings
    redis: {
        ttl: 3600,  // 1 hour
        maxEntries: 10000,
        evictionPolicy: 'LRU'
    },
    
    // Hybrid search settings
    hybrid: {
        contextualWeight: 0.7,
        structuralWeight: 0.3,
        minScore: 0.5
    }
};
```

## Development

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Python tests
pytest scripts/tests/
```

### Building from Source

```bash
# Build Docker images
docker build -t autoweave-memory:latest .
docker build -f Dockerfile.mem0 -t autoweave-mem0-bridge:latest .

# Build for production
npm run build
```

### Debugging

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Check service logs
docker-compose logs -f qdrant
docker-compose logs -f memgraph
docker-compose logs -f redis-ml
docker-compose logs -f mem0-bridge

# Interactive debugging
node --inspect src/index.js
```

## Monitoring

### Health Endpoints

- **Main Service**: `http://localhost:3000/health`
- **mem0 Bridge**: `http://localhost:8090/health`
- **Qdrant**: `http://localhost:6333/`
- **Memgraph**: `bolt://localhost:7687` (use `MATCH (n) RETURN n LIMIT 1`)
- **Redis**: `redis-cli ping`

### Metrics

```bash
# Memory usage metrics
curl http://localhost:3000/api/memory/metrics

# Performance metrics
curl http://localhost:3000/api/memory/performance

# System topology
curl http://localhost:3000/api/memory/topology
```

### Dashboards

- **Memgraph Lab**: http://localhost:3001
- **RedisInsight**: http://localhost:8001
- **Qdrant Dashboard**: http://localhost:6333/dashboard

## Troubleshooting

### Common Issues

1. **Memgraph CrashLoop**
   ```bash
   # Check logs
   docker-compose logs memgraph
   
   # Increase memory limit
   docker-compose down
   # Edit docker-compose.yml: MEMGRAPH_MEMORY_LIMIT=8192
   docker-compose up -d
   ```

2. **Qdrant Connection Failed**
   ```bash
   # Check if Qdrant is running
   curl http://localhost:6333/
   
   # Recreate collection
   curl -X DELETE http://localhost:6333/collections/autoweave_memories
   ```

3. **mem0 Bridge Timeout**
   ```bash
   # Check Python dependencies
   source venv/bin/activate
   pip install --upgrade -r requirements.txt
   
   # Test bridge directly
   python scripts/mem0-bridge.py health
   ```

## Performance Optimization

### Best Practices

1. **Batch Operations**
   ```javascript
   // Good: Batch insert
   await memory.batchStore(memories);
   
   // Avoid: Individual inserts in loop
   for (const mem of memories) {
       await memory.store(mem);
   }
   ```

2. **Use Caching**
   ```javascript
   // Enable aggressive caching for read-heavy workloads
   memory.enableCache({
       aggressive: true,
       preload: ['common-queries']
   });
   ```

3. **Optimize Searches**
   ```javascript
   // Use filters to reduce search space
   const results = await memory.search({
       query: 'monitoring',
       filters: {
           agentType: 'observer',
           timeRange: 'last-7-days'
       }
   });
   ```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/gontrand-hub/autoweave-memory/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gontrand-hub/autoweave-memory/discussions)
- **Documentation**: [AutoWeave Docs](https://docs.autoweave.ai/memory)