// ============================================
// S3 Client – AWS S3 Configuration
// ============================================
// Creates and exports the S3 client instance.
// Requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
// AWS_REGION, and AWS_S3_BUCKET_NAME in your .env file.
// ============================================

const { S3Client } = require("@aws-sdk/client-s3");

let s3Client = null;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

// Only create the S3 client if credentials are provided
const isS3Configured =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION &&
  process.env.AWS_S3_BUCKET_NAME;

if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log("✅ AWS S3 client configured");
} else {
  console.log("⚠️  AWS S3 credentials not found – using demo file data");
}

module.exports = { s3Client, BUCKET_NAME, isS3Configured };
