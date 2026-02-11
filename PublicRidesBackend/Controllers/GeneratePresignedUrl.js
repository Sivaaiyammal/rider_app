const Minio = require('minio');

const s3 = new Minio.Client({
    endPoint: process.env.E2E_BASE,
    accessKey: process.env.E2E_ACCESS_KEY,
    secretKey: process.env.E2E_SECRET_KEY,
});

class GeneratePresignedUrl {
    async generatePresignedURL(req, res) {
        const bucket = process.env.E2E_BUCKET_NAME;
        const objectName = req.query.objectName;
        try {
            const url = await s3.presignedGetObject(bucket, objectName, 60 * 60); // 1 hour
            res.json({ success: true, url });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async generatePresignedImg(objectName) {
        const bucket = process.env.E2E_BUCKET_NAME;
        try {
            const url = await s3.presignedGetObject(bucket, objectName, 60 * 60); // 1 hour
            return url;
        } catch (err) {
            return null;
        }
    }
    
}

module.exports = GeneratePresignedUrl;