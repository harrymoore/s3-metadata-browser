const { S3Client, ListBucketsCommand, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');

class S3Service {
  constructor() {
    // Use AWS default credential chain (supports ~/.aws/credentials, environment variables, IAM roles, etc.)
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      // Credentials will be automatically loaded from AWS credential chain:
      // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
      // 2. AWS credentials file (~/.aws/credentials) - default profile
      // 3. IAM roles (if running on EC2/ECS/Lambda)
      // 4. Other AWS credential providers
    });
  }

  async listBuckets() {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3Client.send(command);
      return response.Buckets || [];
    } catch (error) {
      console.error('Error listing buckets:', error);
      throw new Error(`Failed to list buckets: ${error.message}`);
    }
  }

  async listObjects(bucketName, prefix = '', maxKeys = 1000, continuationToken = null) {
    try {
      const params = {
        Bucket: bucketName,
        MaxKeys: maxKeys,
        Prefix: prefix,
      };

      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      const command = new ListObjectsV2Command(params);
      const response = await this.s3Client.send(command);
      
      return {
        objects: response.Contents || [],
        isTruncated: response.IsTruncated,
        nextContinuationToken: response.NextContinuationToken,
        commonPrefixes: response.CommonPrefixes || []
      };
    } catch (error) {
      console.error('Error listing objects:', error);
      throw new Error(`Failed to list objects: ${error.message}`);
    }
  }

  async getObjectMetadata(bucketName, key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        etag: response.ETag,
        metadata: response.Metadata || {},
        storageClass: response.StorageClass,
        cacheControl: response.CacheControl,
        contentEncoding: response.ContentEncoding,
        expires: response.Expires,
        websiteRedirectLocation: response.WebsiteRedirectLocation,
        serverSideEncryption: response.ServerSideEncryption,
        tags: response.TagSet || []
      };
    } catch (error) {
      console.error('Error getting object metadata:', error);
      throw new Error(`Failed to get object metadata: ${error.message}`);
    }
  }

  async searchObjectsByMetadata(bucketName, metadataFilters = {}, prefix = '') {
    try {
      const allObjects = [];
      let continuationToken = null;
      
      do {
        const response = await this.listObjects(bucketName, prefix, 1000, continuationToken);
        
        // Get metadata for each object and filter
        for (const obj of response.objects) {
          try {
            const metadata = await this.getObjectMetadata(bucketName, obj.Key);
            
            // Check if object matches metadata filters
            const matchesFilter = this.matchesMetadataFilter(metadata, metadataFilters);
            
            if (matchesFilter) {
              allObjects.push({
                ...obj,
                metadata
              });
            }
          } catch (error) {
            // Skip objects that can't be accessed
            console.warn(`Skipping object ${obj.Key}: ${error.message}`);
          }
        }
        
        continuationToken = response.nextContinuationToken;
      } while (continuationToken);
      
      return allObjects;
    } catch (error) {
      console.error('Error searching objects by metadata:', error);
      throw new Error(`Failed to search objects: ${error.message}`);
    }
  }

  matchesMetadataFilter(metadata, filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'contentType' && metadata.contentType) {
        if (!metadata.contentType.toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      } else if (key === 'minSize' && metadata.contentLength) {
        if (metadata.contentLength < parseInt(value)) {
          return false;
        }
      } else if (key === 'maxSize' && metadata.contentLength) {
        if (metadata.contentLength > parseInt(value)) {
          return false;
        }
      } else if (key === 'storageClass' && metadata.storageClass) {
        if (metadata.storageClass !== value) {
          return false;
        }
      } else if (key === 'customMetadata' && metadata.metadata) {
        // Check custom metadata fields
        const [metaKey, metaValue] = value.split('=');
        if (metaKey && metaValue) {
          if (!metadata.metadata[metaKey] || 
              !metadata.metadata[metaKey].toLowerCase().includes(metaValue.toLowerCase())) {
            return false;
          }
        }
      }
    }
    return true;
  }
}

module.exports = new S3Service();