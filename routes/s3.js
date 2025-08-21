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
          console.error(`Failed to get metadata for ${obj.Key}:`, error.message);
          return {
            ...obj,
            metadata: { 
              error: 'Failed to fetch metadata',
              contentType: 'Unknown',
              contentLength: obj.Size,
              lastModified: obj.LastModified,
              storageClass: obj.StorageClass || 'STANDARD'
            }
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

// Get detailed metadata for a specific object
router.get('/buckets/:bucketName/objects/:objectKey/metadata', async (req, res) => {
  try {
    const { bucketName, objectKey } = req.params;
    const decodedKey = decodeURIComponent(objectKey);
    
    const metadata = await s3Service.getObjectMetadata(bucketName, decodedKey);
    res.json(metadata);
  } catch (error) {
    console.error('Error getting object metadata:', error);
    res.status(500).json({ 
      error: 'Failed to get object metadata', 
      message: error.message 
    });
  }
});

// Update metadata for a specific object
router.put('/buckets/:bucketName/objects/:objectKey/metadata', async (req, res) => {
  try {
    const { bucketName, objectKey } = req.params;
    const { metadata } = req.body;
    const decodedKey = decodeURIComponent(objectKey);
    
    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid metadata', 
        message: 'Metadata must be an object' 
      });
    }
    
    const result = await s3Service.updateObjectMetadata(bucketName, decodedKey, metadata);
    res.json(result);
  } catch (error) {
    console.error('Error updating object metadata:', error);
    res.status(500).json({ 
      error: 'Failed to update object metadata', 
      message: error.message 
    });
  }
});

module.exports = router;