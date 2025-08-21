<template>
  <div class="space-y-4">
    <!-- Header with Breadcrumb -->
    <div class="flex items-center justify-between">
      <div class="min-w-0 flex-1">
        <nav class="flex items-center space-x-2 text-sm mb-1">
          <router-link 
            to="/" 
            class="text-dark-600 hover:text-dark-800 font-medium transition-colors"
          >
            Buckets
          </router-link>
          <svg class="w-3 h-3 text-dark-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <router-link 
            :to="`/bucket/${bucketName}`"
            class="text-dark-600 hover:text-dark-800 font-medium transition-colors"
          >
            {{ bucketName }}
          </router-link>
          <svg class="w-3 h-3 text-dark-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-dark-800 font-semibold truncate">{{ objectKey }}</span>
        </nav>
        <h1 class="text-lg font-bold text-dark-900">Object Details</h1>
        <p class="text-sm text-dark-700 mt-0.5 font-mono break-all">{{ objectKey }}</p>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <button
          v-if="!editing"
          @click="startEditing"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded border bg-primary-600 text-white border-primary-600 hover:bg-primary-700 transition-colors"
        >
          <svg class="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Metadata
        </button>
        <button
          v-if="editing"
          @click="saveMetadata"
          :disabled="saving"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded border bg-primary-600 text-white border-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="saving" class="w-3 h-3 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-else>
            <svg class="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <button
          v-if="editing"
          @click="cancelEditing"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded border bg-dark-50 text-dark-800 border-dark-400 hover:bg-dark-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <span class="ml-2 text-sm text-dark-700">Loading object details...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded p-4">
      <div class="flex items-start">
        <svg class="w-4 h-4 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Error loading object</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="metadata" class="space-y-4">
      <!-- System Metadata -->
      <div class="bg-dark-50 border border-dark-300 rounded shadow-sm">
        <div class="px-4 py-3 border-b border-dark-300">
          <h3 class="text-sm font-semibold text-dark-900">System Properties</h3>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-dark-700 mb-1">Content Type</label>
              <div class="text-sm text-dark-900 bg-white border border-dark-300 rounded px-2 py-1.5">
                {{ metadata.contentType || 'Unknown' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-dark-700 mb-1">Size</label>
              <div class="text-sm text-dark-900 bg-white border border-dark-300 rounded px-2 py-1.5 font-mono">
                {{ formatFileSize(metadata.contentLength) }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-dark-700 mb-1">Last Modified</label>
              <div class="text-sm text-dark-900 bg-white border border-dark-300 rounded px-2 py-1.5 font-mono">
                {{ formatDate(metadata.lastModified) }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-dark-700 mb-1">Storage Class</label>
              <div class="text-sm text-dark-900 bg-white border border-dark-300 rounded px-2 py-1.5">
                {{ metadata.storageClass || 'STANDARD' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-dark-700 mb-1">ETag</label>
              <div class="text-sm text-dark-900 bg-white border border-dark-300 rounded px-2 py-1.5 font-mono break-all">
                {{ metadata.etag || 'N/A' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Metadata -->
      <div class="bg-dark-50 border border-dark-300 rounded shadow-sm">
        <div class="px-4 py-3 border-b border-dark-300">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-dark-900">Custom Metadata</h3>
            <div v-if="!editing && (!customMetadata || Object.keys(customMetadata).length === 0)" class="text-xs text-dark-600">
              No custom metadata
            </div>
          </div>
        </div>
        <div class="p-4">
          <!-- View Mode -->
          <div v-if="!editing">
            <div v-if="customMetadata && Object.keys(customMetadata).length > 0" class="space-y-3">
              <div v-for="[key, value] in Object.entries(customMetadata)" :key="key" class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-dark-700 mb-1">Key</label>
                  <div class="text-sm text-dark-900 bg-white border border-dark-300 rounded px-2 py-1.5">
                    {{ key }}
                  </div>
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-medium text-dark-700 mb-1">Value</label>
                  <div class="text-sm text-dark-900 bg-white border border-dark-300 rounded px-2 py-1.5 break-all">
                    {{ value }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <svg class="w-8 h-8 text-dark-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-sm text-dark-600">No custom metadata defined</p>
              <p class="text-xs text-dark-500 mt-1">Click "Edit Metadata" to add custom properties</p>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else>
            <div class="space-y-3">
              <div v-for="(item, index) in editableMetadata" :key="index" class="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label class="block text-xs font-medium text-dark-700 mb-1">Key</label>
                  <input
                    v-model="item.key"
                    type="text"
                    placeholder="metadata-key"
                    class="w-full px-2 py-1.5 border border-dark-400 rounded text-sm bg-white text-dark-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-dark-700 mb-1">Value</label>
                  <input
                    v-model="item.value"
                    type="text"
                    placeholder="metadata-value"
                    class="w-full px-2 py-1.5 border border-dark-400 rounded text-sm bg-white text-dark-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <button
                    @click="removeMetadataItem(index)"
                    class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="Remove this metadata item"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <button
                @click="addMetadataItem"
                class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors"
              >
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Metadata
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { s3Api } from '../services/api'

export default {
  name: 'ObjectDetail',
  data() {
    return {
      metadata: null,
      loading: false,
      error: null,
      editing: false,
      saving: false,
      editableMetadata: []
    }
  },
  computed: {
    bucketName() {
      return this.$route.params.bucketName
    },
    objectKey() {
      return this.$route.params.objectKey
    },
    customMetadata() {
      if (!this.metadata || !this.metadata.userMetadata) return {}
      return this.metadata.userMetadata
    }
  },
  mounted() {
    this.loadObjectMetadata()
  },
  methods: {
    async loadObjectMetadata() {
      this.loading = true
      this.error = null
      
      try {
        const encodedKey = encodeURIComponent(this.objectKey)
        const response = await s3Api.get(`/buckets/${this.bucketName}/objects/${encodedKey}/metadata`)
        this.metadata = response.data
      } catch (error) {
        console.error('Error loading object metadata:', error)
        this.error = error.response?.data?.message || 'Failed to load object metadata'
      } finally {
        this.loading = false
      }
    },
    
    startEditing() {
      this.editing = true
      // Initialize editable metadata from current custom metadata
      this.editableMetadata = Object.entries(this.customMetadata || {}).map(([key, value]) => ({
        key,
        value
      }))
      
      // Add one empty row if no metadata exists
      if (this.editableMetadata.length === 0) {
        this.editableMetadata.push({ key: '', value: '' })
      }
    },
    
    cancelEditing() {
      this.editing = false
      this.editableMetadata = []
    },
    
    addMetadataItem() {
      this.editableMetadata.push({ key: '', value: '' })
    },
    
    removeMetadataItem(index) {
      this.editableMetadata.splice(index, 1)
    },
    
    async saveMetadata() {
      this.saving = true
      
      try {
        // Convert editable metadata to object, filtering out empty entries
        const metadata = {}
        this.editableMetadata.forEach(item => {
          if (item.key.trim() && item.value.trim()) {
            metadata[item.key.trim()] = item.value.trim()
          }
        })
        
        const encodedKey = encodeURIComponent(this.objectKey)
        await s3Api.put(`/buckets/${this.bucketName}/objects/${encodedKey}/metadata`, { metadata })
        
        // Reload metadata to get updated values
        await this.loadObjectMetadata()
        this.editing = false
        this.editableMetadata = []
        
        // Show success message (you could add a toast notification here)
        console.log('Metadata updated successfully')
      } catch (error) {
        console.error('Error saving metadata:', error)
        this.error = error.response?.data?.message || 'Failed to save metadata'
      } finally {
        this.saving = false
      }
    },
    
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString()
    }
  }
}
</script>
