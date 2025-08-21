import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

export const s3Api = {
  // Get all buckets
  getBuckets() {
    return api.get('/s3/buckets')
  },

  // Get objects in a bucket
  getObjects(bucketName, params = {}) {
    return api.get(`/s3/buckets/${bucketName}/objects`, { params })
  },

  // Get objects with metadata for table view
  getObjectsWithMetadata(bucketName, params = {}) {
    return api.get(`/s3/buckets/${bucketName}/objects-with-metadata`, { params })
  },

  // Get object metadata
  getObjectMetadata(bucketName, key) {
    const encodedKey = encodeURIComponent(key)
    return api.get(`/s3/buckets/${bucketName}/objects/${encodedKey}/metadata`)
  },

  // Search objects by metadata
  searchObjects(bucketName, filters, prefix = '') {
    return api.post(`/s3/buckets/${bucketName}/search`, {
      filters,
      prefix
    })
  }
}

export default api