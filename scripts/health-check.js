#!/usr/bin/env node

/**
 * Health check script for AutoWeave Memory System
 */

const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const services = {
    qdrant: {
        name: 'Qdrant Vector DB',
        url: 'http://localhost:6333/',
        check: async () => {
            const response = await axios.get('http://localhost:6333/');
            return response.data.title === 'qdrant - vector search engine';
        }
    },
    memgraph: {
        name: 'Memgraph Graph DB',
        check: async () => {
            try {
                const { stdout } = await execAsync('echo "MATCH (n) RETURN COUNT(n) as count;" | docker exec -i autoweave-memgraph mgconsole --use-ssl=false');
                return stdout.includes('count');
            } catch (error) {
                return false;
            }
        }
    },
    redis: {
        name: 'Redis ML Cache',
        check: async () => {
            try {
                const { stdout } = await execAsync('redis-cli ping');
                return stdout.trim() === 'PONG';
            } catch (error) {
                return false;
            }
        }
    },
    mem0Bridge: {
        name: 'mem0 Bridge',
        url: 'http://localhost:8090/health',
        check: async () => {
            try {
                const response = await axios.get('http://localhost:8090/health');
                return response.data.status === 'healthy';
            } catch (error) {
                return false;
            }
        }
    },
    memoryService: {
        name: 'Memory Service',
        url: 'http://localhost:3000/health',
        check: async () => {
            try {
                const response = await axios.get('http://localhost:3000/health');
                return response.data.status === 'healthy';
            } catch (error) {
                return false;
            }
        }
    }
};

async function checkHealth() {
    console.log('🔍 AutoWeave Memory System Health Check\n');
    console.log('=' .repeat(50));
    
    let allHealthy = true;
    
    for (const [key, service] of Object.entries(services)) {
        process.stdout.write(`Checking ${service.name}... `);
        
        try {
            const isHealthy = await service.check();
            
            if (isHealthy) {
                console.log('✅ Healthy');
                if (service.url) {
                    console.log(`   URL: ${service.url}`);
                }
            } else {
                console.log('❌ Unhealthy');
                allHealthy = false;
            }
        } catch (error) {
            console.log('❌ Failed');
            console.log(`   Error: ${error.message}`);
            allHealthy = false;
        }
        
        console.log('');
    }
    
    console.log('=' .repeat(50));
    
    if (allHealthy) {
        console.log('✅ All services are healthy!');
        
        // Additional checks
        console.log('\n📊 Additional Information:');
        
        try {
            // Check Docker containers
            const { stdout: dockerPs } = await execAsync('docker ps --format "table {{.Names}}\t{{.Status}}" | grep autoweave');
            console.log('\nDocker Containers:');
            console.log(dockerPs);
        } catch (error) {
            console.log('Docker containers not found or Docker not running');
        }
        
        try {
            // Check memory usage
            const response = await axios.get('http://localhost:3000/api/memory/metrics');
            console.log('\nMemory Metrics:');
            console.log(`- Total Searches: ${response.data.searches || 0}`);
            console.log(`- Cache Hits: ${response.data.cache_hits || 0}`);
            console.log(`- Average Search Time: ${response.data.avg_search_time || 'N/A'}ms`);
        } catch (error) {
            console.log('Unable to fetch memory metrics');
        }
        
    } else {
        console.log('❌ Some services are unhealthy!');
        console.log('\n🔧 Troubleshooting Tips:');
        console.log('1. Run: docker-compose ps');
        console.log('2. Check logs: docker-compose logs [service-name]');
        console.log('3. Restart services: docker-compose restart');
        console.log('4. Check .env file configuration');
        
        process.exit(1);
    }
}

// Run health check
checkHealth().catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
});