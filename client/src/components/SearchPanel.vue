<template>
  <div class="bg-white border border-secondary-200 rounded-lg shadow-sm p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-secondary-900">Filter Objects</h3>
      <button
        @click="clearFilters"
        class="text-sm text-secondary-500 hover:text-secondary-700 font-medium underline focus:outline-none"
      >
        Clear filters
      </button>
    </div>
    
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Content Type Filter -->
      <div>
        <label for="contentType" class="block text-sm font-medium text-gray-700">
          Content Type
        </label>
        <input
          id="contentType"
          v-model="filters.contentType"
          type="text"
          placeholder="e.g., image/jpeg, text/csv"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <!-- Minimum Size Filter -->
      <div>
        <label for="minSize" class="block text-sm font-medium text-gray-700">
          Min Size (bytes)
        </label>
        <input
          id="minSize"
          v-model="filters.minSize"
          type="number"
          placeholder="0"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <!-- Maximum Size Filter -->
      <div>
        <label for="maxSize" class="block text-sm font-medium text-gray-700">
          Max Size (bytes)
        </label>
        <input
          id="maxSize"
          v-model="filters.maxSize"
          type="number"
          placeholder="1000000"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <!-- Storage Class Filter -->
      <div>
        <label for="storageClass" class="block text-sm font-medium text-gray-700">
          Storage Class
        </label>
        <select
          id="storageClass"
          v-model="filters.storageClass"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">All Classes</option>
          <option value="STANDARD">STANDARD</option>
          <option value="REDUCED_REDUNDANCY">REDUCED_REDUNDANCY</option>
          <option value="STANDARD_IA">STANDARD_IA</option>
          <option value="ONEZONE_IA">ONEZONE_IA</option>
          <option value="INTELLIGENT_TIERING">INTELLIGENT_TIERING</option>
          <option value="GLACIER">GLACIER</option>
          <option value="DEEP_ARCHIVE">DEEP_ARCHIVE</option>
        </select>
      </div>

      <!-- Custom Metadata Filter -->
      <div class="sm:col-span-2">
        <label for="customMetadata" class="block text-sm font-medium text-gray-700">
          Custom Metadata
        </label>
        <input
          id="customMetadata"
          v-model="filters.customMetadata"
          type="text"
          placeholder="key=value (e.g., author=john, department=marketing)"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <p class="mt-1 text-sm text-gray-500">
          Search custom metadata fields using key=value format
        </p>
      </div>
    </div>

    <!-- Search Actions -->
    <div class="mt-6 flex justify-end space-x-3">
      <button
        @click="$emit('clear')"
        type="button"
        class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Show All Objects
      </button>
      <button
        @click="performSearch"
        :disabled="!hasFilters"
        :class="[
          'py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          hasFilters 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-300 cursor-not-allowed'
        ]"
      >
        Search Objects
      </button>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-4 border-t pt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="filter in activeFiltersList"
          :key="filter.key"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ filter.label }}
          <button
            @click="removeFilter(filter.key)"
            class="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600 focus:outline-none"
          >
            <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
              <path d="m0 0 8 8m0-8-8 8"/>
            </svg>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchPanel',
  emits: ['search', 'clear'],
  data() {
    return {
      filters: {
        contentType: '',
        minSize: '',
        maxSize: '',
        storageClass: '',
        customMetadata: ''
      }
    }
  },
  computed: {
    hasFilters() {
      return Object.values(this.filters).some(value => value !== '')
    },
    hasActiveFilters() {
      return this.hasFilters
    },
    activeFiltersList() {
      const list = []
      
      if (this.filters.contentType) {
        list.push({ key: 'contentType', label: `Type: ${this.filters.contentType}` })
      }
      if (this.filters.minSize) {
        list.push({ key: 'minSize', label: `Min Size: ${this.filters.minSize}B` })
      }
      if (this.filters.maxSize) {
        list.push({ key: 'maxSize', label: `Max Size: ${this.filters.maxSize}B` })
      }
      if (this.filters.storageClass) {
        list.push({ key: 'storageClass', label: `Class: ${this.filters.storageClass}` })
      }
      if (this.filters.customMetadata) {
        list.push({ key: 'customMetadata', label: `Metadata: ${this.filters.customMetadata}` })
      }
      
      return list
    }
  },
  methods: {
    performSearch() {
      if (!this.hasFilters) return
      
      const cleanFilters = {}
      Object.entries(this.filters).forEach(([key, value]) => {
        if (value !== '') {
          cleanFilters[key] = value
        }
      })
      
      this.$emit('search', cleanFilters)
    },
    clearFilters() {
      this.filters = {
        contentType: '',
        minSize: '',
        maxSize: '',
        storageClass: '',
        customMetadata: ''
      }
    },
    removeFilter(key) {
      this.filters[key] = ''
      if (this.hasFilters) {
        this.performSearch()
      } else {
        this.$emit('clear')
      }
    }
  }
}
</script>