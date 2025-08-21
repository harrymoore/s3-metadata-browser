<template>
  <div class="bg-white rounded-lg border border-secondary-200 shadow-sm overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
        <div class="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <span class="ml-3 text-sm text-secondary-600">Loading objects...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-red-800">Failed to load objects</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            <div class="mt-3">
              <button
                @click="$emit('refresh')"
                class="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="objects.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-200">
        <thead class="bg-secondary-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
              Object Name
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
              Size
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
              Last Modified
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
              Type
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
              Storage Class
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
              Metadata
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-secondary-100">
          <tr v-for="object in objects" :key="object.Key" class="hover:bg-secondary-50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center">
                <div class="w-6 h-6 bg-secondary-100 rounded flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="ml-3 min-w-0 flex-1">
                  <p class="text-sm font-medium text-secondary-900 truncate" :title="object.Key">
                    {{ object.Key }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="text-sm text-secondary-900 font-mono">
                {{ formatFileSize(object.Size || object.metadata?.contentLength) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="text-sm text-secondary-600 font-mono">
                {{ formatDate(object.LastModified || object.metadata?.lastModified) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {{ object.metadata?.contentType || 'Unknown' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warm-100 text-warm-800">
                {{ object.StorageClass || object.metadata?.storageClass || 'STANDARD' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div v-if="hasCustomMetadata(object.metadata)" class="flex flex-wrap gap-1">
                <span 
                  v-for="[key, value] in getCustomMetadataEntries(object.metadata)" 
                  :key="key"
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-accent-100 text-accent-800"
                >
                  {{ key }}: {{ value }}
                </span>
              </div>
              <span v-else class="text-xs text-secondary-400">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto">
        <svg class="w-6 h-6 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-sm font-medium text-secondary-900 mt-4">No objects found</h3>
      <p class="text-sm text-secondary-500 mt-2">This bucket is empty or no objects match your current filters.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ObjectTable',
  props: {
    objects: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  emits: ['refresh'],
  methods: {
    formatFileSize(bytes) {
      if (!bytes) return 'Unknown'
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      if (bytes === 0) return '0 B'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    },
    formatDate(dateString) {
      if (!dateString) return 'Unknown'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    },
    hasCustomMetadata(metadata) {
      return metadata && metadata.metadata && Object.keys(metadata.metadata).length > 0
    },
    getCustomMetadataEntries(metadata) {
      if (!metadata || !metadata.metadata) return []
      return Object.entries(metadata.metadata).slice(0, 3) // Limit to 3 entries for display
    }
  }
}
</script>