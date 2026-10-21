// Test with corrected lowercase bucket name
require("dotenv").config();
const { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION;
const BUCKET = "cloud-storage-badal-2026"; // lowercase

console.log(`Testing S3 connection...`);
console.log(`  Bucket: ${BUCKET}`);
console.log(`  Region: ${REGION}\n`);

const client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

(async () => {
  try {
    // Test 1: Read
    console.log("Test 1: ListObjectsV2 (read access)...");
    const listResult = await client.send(
      new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 1 })
    );
    console.log(`  ✅ PASS — bucket accessible, ${listResult.KeyCount} key(s)\n`);

    // Test 2: Write
    const testKey = "__cloudbox_connection_test__";
    console.log("Test 2: PutObject (write access)...");
    await client.send(
      new PutObjectCommand({ Bucket: BUCKET, Key: testKey, Body: "test", ContentType: "text/plain" })
    );
    console.log(`  ✅ PASS — wrote test object\n`);

    // Test 3: Delete
    console.log("Test 3: DeleteObject (cleanup)...");
    await client.send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: testKey })
    );
    console.log(`  ✅ PASS — deleted test object\n`);

    console.log("========================================");
    console.log("ALL TESTS PASSED — S3 is working!");
    console.log("========================================");
  } catch (err) {
    console.error(`  ❌ FAIL — ${err.name}: ${err.message}`);
    process.exit(1);
  }
})();
