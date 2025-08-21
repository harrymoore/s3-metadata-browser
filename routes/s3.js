const express = require('express');
const router = express.Router();
const s3Service = require('../services/s3Service');

// Get all buckets
router.get('/buckets', async (req, res) => {
  try {
    const buckets = await s3Service.listBuckets();
    res.json(buckets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get objects in a bucket
router.get('/buckets/:bucketName/objects', async (req, res) => {
  try {
    const { bucketName } = req.params;
    const { prefix = '', maxKeys = 100, continuationToken } = req.query;
    
    const result = await s3Service.listObjects(
      bucketName, 
      prefix, 
      parseInt(maxKeys), 
      continuationToken
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get object metadata
router.get('/buckets/:bucketName/objects/:key/metadata', async (req, res) => {
  try {
    const { bucketName, key } = req.params;
    const decodedKey = decodeURIComponent(key);
    
    const metadata = await s3Service.getObjectMetadata(bucketName, decodedKey);
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search objects by metadata
router.post('/buckets/:bucketName/search', async (req, res) => {
  try {
    const { bucketName } = req.params;
    const { filters = {}, prefix = '' } = req.body;
    
    const objects = await s3Service.searchObjectsByMetadata(bucketName, filters, prefix);
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get objects with metadata (for table view)
router.get('/buckets/:bucketName/objects-with-metadata', async (req, res) => {
  try {
    const { bucketName } = req.params;
    const { prefix = '', limit = 50 } = req.query;
    
    const result = await s3Service.listObjects(bucketName, prefix, parseInt(limit));
    
    // Get metadata for each object
    const objectsWithMetadata = await Promise.all(
      result.objects.slice(0, 20).map(async (obj) => { // Limit to 20 for performance
        try {
          const metadata = await s3Service.getObjectMetadata(bucketName, obj.Key);
          return {
            ...obj,
            metadata
          };
        } catch (error) {
          return {
            ...obj,
            metadata: { error: 'Failed to fetch metadata' }
          };
        }
      })
    );
    
    res.json({
      ...result,
      objects: objectsWithMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;