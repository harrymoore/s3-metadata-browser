const { S3Client, ListBucketsCommand, ListObjectsV2Command, HeadObjectCommand, GetBucketLocationCommand, CopyObjectCommand } = require('@aws-sdk/client-s3');

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
    
    // Cache for region-specific clients
    this.regionClients = new Map();
    this.bucketRegions = new Map();
  }

  // Get or create a region-specific S3 client
  getRegionClient(region) {
    if (!this.regionClients.has(region)) {
      this.regionClients.set(region, new S3Client({
        region: region,
      }));
    }
    return this.regionClients.get(region);
  }

  // Get the region of a bucket
  async getBucketRegion(bucketName) {
    if (this.bucketRegions.has(bucketName)) {
      return this.bucketRegions.get(bucketName);
    }

    try {
      const command = new GetBucketLocationCommand({ Bucket: bucketName });
      const response = await this.s3Client.send(command);
      // AWS returns null for us-east-1, so handle that case
      const region = response.LocationConstraint || 'us-east-1';
      this.bucketRegions.set(bucketName, region);
      return region;
    } catch (error) {
      console.warn(`Could not determine region for bucket ${bucketName}, using default`);
      return process.env.AWS_REGION || 'us-east-1';
    }
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
      // First try with default client
      let client = this.s3Client;
      
      const params = {
        Bucket: bucketName,
        MaxKeys: maxKeys,
        Prefix: prefix,
      };

      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      try {
        const command = new ListObjectsV2Command(params);
        const response = await client.send(command);
        
        return {
          objects: response.Contents || [],
          isTruncated: response.IsTruncated,
          nextContinuationToken: response.NextContinuationToken,
          commonPrefixes: response.CommonPrefixes || []
        };
      } catch (redirectError) {
        // If we get a redirect error, try with the correct region
        if (redirectError.Code === 'PermanentRedirect') {
          console.log(`Bucket ${bucketName} requires region-specific client, retrying...`);
          const bucketRegion = await this.getBucketRegion(bucketName);
          client = this.getRegionClient(bucketRegion);
          
          const command = new ListObjectsV2Command(params);
          const response = await client.send(command);
          
          return {
            objects: response.Contents || [],
            isTruncated: response.IsTruncated,
            nextContinuationToken: response.NextContinuationToken,
            commonPrefixes: response.CommonPrefixes || []
          };
        }
        throw redirectError;
      }
    } catch (error) {
      console.error('Error listing objects:', error);
      throw new Error(`Failed to list objects: ${error.message}`);
    }
  }

  async getObjectMetadata(bucketName, key) {
    try {
      // First try with default client
      let client = this.s3Client;
      
      try {
        const command = new HeadObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        const response = await client.send(command);
        
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
      } catch (redirectError) {
        // If we get a redirect error, try with the correct region
        if (redirectError.Code === 'PermanentRedirect') {
          const bucketRegion = await this.getBucketRegion(bucketName);
          client = this.getRegionClient(bucketRegion);
          
          const command = new HeadObjectCommand({
            Bucket: bucketName,
            Key: key,
          });
          const response = await client.send(command);
          
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
        }
        throw redirectError;
      }
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