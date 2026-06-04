#!/usr/bin/env node
/**
 * Test S3/MinIO connection
 * Usage: node test-s3-connection.js
 */
require('dotenv').config();
const Minio = require('minio');

const config = {
    endpoint: process.env.E2E_BASE,
    accessKey: process.env.E2E_ACCESS_KEY,
    secretKey: process.env.E2E_SECRET_KEY,
    bucket: process.env.E2E_BUCKET_NAME,
};

console.log('═════════════════════════════════════════');
console.log('S3/MinIO Connection Test');
console.log('═════════════════════════════════════════\n');

// Check environment variables
console.log('Environment Variables:');
console.log(`  E2E_BASE: ${config.endpoint || '❌ MISSING'}`);
console.log(`  E2E_ACCESS_KEY: ${config.accessKey ? '✓ Set' : '❌ MISSING'}`);
console.log(`  E2E_SECRET_KEY: ${config.secretKey ? '✓ Set' : '❌ MISSING'}`);
console.log(`  E2E_BUCKET_NAME: ${config.bucket || '❌ MISSING'}\n`);

// Parse endpoint
const parseEndpoint = (rawEndpoint) => {
    if (!rawEndpoint) return { host: 'unknown', port: 'unknown', useSSL: 'unknown' };
    
    let url = rawEndpoint.trim();
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168.') || url.includes('10.');
    let useSSL = process.env.E2E_USE_SSL
        ? String(process.env.E2E_USE_SSL).toLowerCase() === 'true'
        : !isLocal;
    let port = 9000;

    if (isLocal) {
        port = 9000;
        if (url.startsWith('http://')) {
            url = url.replace('http://', '');
        } else if (url.startsWith('https://')) {
            url = url.replace('https://', '');
        }
    } else {
        if (url.startsWith('https://')) {
            useSSL = true;
            url = url.replace('https://', '');
            port = 443;
        } else if (url.startsWith('http://')) {
            useSSL = false;
            url = url.replace('http://', '');
            port = 80;
        }
    }

    if (url.includes(':')) {
        const parts = url.split(':');
        const host = parts[0];
        const portStr = parts[1]?.split('/')[0];
        const portNum = parseInt(portStr, 10);
        if (!isNaN(portNum)) {
            port = portNum;
            url = host;
        }
    }

    const host = url.split('/')[0];
    return { host, port, useSSL };
};

const parsed = parseEndpoint(config.endpoint);
console.log('Parsed Endpoint Configuration:');
console.log(`  Host: ${parsed.host}`);
console.log(`  Port: ${parsed.port}`);
console.log(`  Use SSL: ${parsed.useSSL}\n`);

// Validate requirements
const issues = [];
if (!config.endpoint) issues.push('Missing E2E_BASE endpoint');
if (!config.accessKey) issues.push('Missing E2E_ACCESS_KEY');
if (!config.secretKey) issues.push('Missing E2E_SECRET_KEY');
if (!config.bucket) issues.push('Missing E2E_BUCKET_NAME');

if (issues.length > 0) {
    console.log('❌ Configuration Issues:');
    issues.forEach(issue => console.log(`  • ${issue}`));
    process.exit(1);
}

// Try to create client and test connection
console.log('Testing S3 Connection...\n');

try {
    const client = new Minio.Client({
        endPoint: parsed.host,
        port: parsed.port,
        useSSL: parsed.useSSL,
        accessKey: config.accessKey,
        secretKey: config.secretKey,
    });

    // Try to list buckets
    client.listBuckets((err, buckets) => {
        if (err) {
            console.log('❌ Connection Failed!');
            console.log(`Error: ${err.message}`);
            console.log(`Code: ${err.code}\n`);
            
            if (err.code === 'ECONNREFUSED') {
                console.log('💡 Suggestions:');
                console.log('  1. Is MinIO running? Start with: docker-compose up -d');
                console.log('  2. Is the endpoint correct? Current: ' + config.endpoint);
                console.log('  3. Is the port correct? Using: ' + parsed.port);
                console.log('  4. Check credentials: ' + config.accessKey + '/' + config.secretKey);
            }
            process.exit(1);
        } else {
            console.log('✅ Connection Successful!\n');
            console.log('Available Buckets:');
            if (buckets.length === 0) {
                console.log('  (none)');
            } else {
                buckets.forEach(b => {
                    const isTarget = b.name === config.bucket ? ' ← Target' : '';
                    console.log(`  • ${b.name}${isTarget}`);
                });
            }

            // Check if target bucket exists
            if (!buckets.some(b => b.name === config.bucket)) {
                console.log(`\n⚠️  Warning: Bucket '${config.bucket}' not found!`);
            } else {
                console.log(`\n✓ Target bucket '${config.bucket}' exists`);
            }

            console.log('\n═════════════════════════════════════════');
            console.log('✓ All checks passed!');
            console.log('═════════════════════════════════════════');
            process.exit(0);
        }
    });
} catch (err) {
    console.log('❌ Failed to create S3 client!');
    console.log(`Error: ${err.message}`);
    process.exit(1);
}
