const Minio = require('minio');

// Parse S3 endpoint to handle both URLs and raw endpoints
const parseS3Endpoint = (rawEndpoint) => {
    if (!rawEndpoint) {
        console.error('[S3 Init] No endpoint provided');
        return { host: '127.0.0.1', port: 9000, useSSL: false };
    }

    let url = rawEndpoint.trim();
    let useSSL = true;
    let port = 9000; // Default MinIO port

    // Detect local addresses — no SSL, port 9000
    // Matches: localhost, 127.0.0.1, any 192.168.x.x, any 10.x.x.x
    const isLocal = (h) =>
        h.includes('localhost') ||
        h.includes('127.0.0.1') ||
        /^192\.168\./.test(h) ||
        /^10\./.test(h);

    if (isLocal(url)) {
        useSSL = false;
        port = 9000;
        // Remove protocol if present
        if (url.startsWith('http://')) {
            url = url.replace('http://', '');
        } else if (url.startsWith('https://')) {
            url = url.replace('https://', '');
        }
    } else {
        // Remove protocol if present for remote endpoints
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

    // Extract port if present (e.g., "localhost:9000" or "s3.example.com:8443")
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

    // Remove trailing path if present
    const host = url.split('/')[0];

    const config = {
        host,
        port,
        useSSL,
        rawEndpoint: rawEndpoint
    };

    return config;
};

// Initialize S3 client with proper error checking
const initializeS3Client = () => {
    const rawEndpoint = process.env.E2E_BASE;
    const accessKey = process.env.E2E_ACCESS_KEY;
    const secretKey = process.env.E2E_SECRET_KEY;
    const bucket = process.env.E2E_BUCKET_NAME;

    if (!accessKey || !secretKey) {
        console.error('[S3 Init] Missing S3 credentials - requests will fail');
    }

    if (!bucket) {
        console.error('[S3 Init] Missing bucket name - requests will fail');
    }

    if (!rawEndpoint) {
        console.error('[S3 Init] Missing endpoint - requests will fail');
    }

    const endpointConfig = parseS3Endpoint(rawEndpoint);

    const clientConfig = {
        endPoint: endpointConfig.host,
        port: endpointConfig.port,
        useSSL: endpointConfig.useSSL,
        accessKey: accessKey || '',
        secretKey: secretKey || '',
    };

    return new Minio.Client(clientConfig);
};

let s3 = initializeS3Client();

class GeneratePresignedUrl {
    // Use arrow function to preserve 'this' binding for async route handlers
    generatePresignedURL = async (req, res) => {
        const bucket = process.env.E2E_BUCKET_NAME;
        const rawObjectName = req.query.objectName;

        // Validate inputs
        if (!bucket) {
            console.error('[Presigned URL] Missing E2E_BUCKET_NAME environment variable');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error: missing bucket name',
            });
        }

        if (!rawObjectName) {
            console.error('[Presigned URL] Missing objectName query parameter');
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: objectName',
            });
        }

        // Decode the objectName from URL encoding
        let objectName;
        try {
            objectName = decodeURIComponent(rawObjectName);
        } catch (err) {
            console.error('[Presigned URL] Failed to decode objectName:', rawObjectName, err.message);
            return res.status(400).json({
                success: false,
                message: 'Invalid objectName parameter',
            });
        }

        try {
            console.log('[Presigned URL] Generating for bucket:', bucket, 'object:', objectName);
            const url = await s3.presignedGetObject(bucket, objectName, 60 * 60); // 1 hour
            console.log('[Presigned URL] Successfully generated URL');
            res.json({ success: true, url });
        } catch (err) {
            // Provide detailed error diagnostics
            const isConnectionError = err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED');
            const errorDetails = {
                bucket,
                objectName,
                error: err.message,
                code: err.code,
                isConnectionError,
                endpoint: process.env.E2E_BASE,
                suggestion: isConnectionError 
                    ? 'S3 endpoint is unreachable. Check E2E_BASE, E2E_ACCESS_KEY, and E2E_SECRET_KEY environment variables.'
                    : 'Check object name and bucket configuration.',
            };

            console.error('[Presigned URL] Error generating presigned URL:', errorDetails);

            const statusCode = isConnectionError ? 503 : 500;
            const message = isConnectionError
                ? 'S3 service unavailable - connection failed'
                : 'Failed to generate presigned URL';

            res.status(statusCode).json({
                success: false,
                message,
                details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
            });
        }
    };

    generatePresignedImg = async (objectName) => {
        const bucket = process.env.E2E_BUCKET_NAME;
        try {
            console.log('[Presigned Img] Generating for:', objectName);
            const url = await s3.presignedGetObject(bucket, objectName, 60 * 60); // 1 hour
            return url;
        } catch (err) {
            console.error('[Presigned Img] Error:', objectName, err.message);
            return null;
        }
    };
}

module.exports = GeneratePresignedUrl;