<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-dark-900">S3 Buckets</h1>
        <p class="text-sm text-dark-700 mt-0.5">Browse and analyze your AWS S3 storage buckets</p>
      </div>
      <div v-if="!loading && buckets.length > 0" class="text-sm text-dark-600">
        {{ filteredAndSortedBuckets.length }} of {{ buckets.length }} bucket{{ buckets.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Search and Sort Controls -->
    <div v-if="!loading && buckets.length > 0" class="bg-dark-50 border border-dark-300 rounded shadow-sm p-3">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-3">
        <!-- Search -->
        <div class="flex-1 max-w-sm">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Search buckets..."
              class="block w-full pl-8 pr-2 py-1.5 border border-dark-400 rounded text-sm placeholder-dark-500 bg-white text-dark-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <!-- Sort Controls -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-dark-800">Sort:</label>
          <select
            v-model="sortBy"
            class="border border-dark-400 rounded px-2 py-1.5 text-sm bg-white text-dark-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="name">Name</option>
            <option value="creationDate">Date</option>
            <option value="objectCount">Objects</option>
          </select>
          <button
            @click="toggleSortOrder"
            class="p-1.5 border border-dark-400 rounded hover:bg-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            :title="sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'"
          >
            <svg 
              class="w-3 h-3 text-dark-600 transition-transform" 
              :class="{ 'rotate-180': sortOrder === 'desc' }"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            @click="resetFiltersAndSort"
            class="px-2 py-1.5 text-xs font-medium text-dark-700 hover:text-dark-900 hover:bg-dark-200 rounded transition-colors"
            :disabled="!hasActiveFiltersOrSort"
            :class="{ 'opacity-50 cursor-not-allowed': !hasActiveFiltersOrSort }"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-primary-600 rounded-full animate-bounce"></div>
        <div class="w-4 h-4 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-4 h-4 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">Failed to load buckets</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          <div class="mt-3">
            <button
              @click="loadBuckets"
              class="text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bucket List -->
    <div v-else-if="filteredAndSortedBuckets.length > 0" class="bg-dark-50 border border-dark-300 rounded shadow-sm overflow-hidden">
      <div class="divide-y divide-dark-300">
        <div
          v-for="bucket in filteredAndSortedBuckets"
          :key="bucket.Name"
          class="hover:bg-dark-200 cursor-pointer transition-colors"
          @click="selectBucket(bucket.Name)"
        >
          <div class="px-4 py-3 flex items-center justify-between">
            <div class="flex items-center min-w-0 flex-1">
              <div class="w-6 h-6 bg-primary-600 rounded flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div class="ml-3 min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-dark-900 truncate">{{ bucket.Name }}</h3>
                <div class="flex items-center space-x-3 mt-0.5">
                  <p class="text-xs text-dark-600 font-mono">{{ formatDate(bucket.CreationDate) }}</p>
                  <p v-if="objectCounts[bucket.Name] !== undefined" class="text-xs text-dark-600">
                    {{ objectCounts[bucket.Name] }} object{{ objectCounts[bucket.Name] !== 1 ? 's' : '' }}
                  </p>
                  <div v-else-if="sortBy === 'objectCount'" class="flex items-center">
                    <div class="w-2 h-2 bg-dark-400 rounded-full animate-pulse"></div>
                    <span class="ml-1 text-xs text-dark-400">...</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ml-3 flex-shrink-0">
              <svg class="w-3 h-3 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results State -->
    <div v-else-if="buckets.length > 0 && filteredAndSortedBuckets.length === 0" class="text-center py-10">
      <div class="w-10 h-10 bg-dark-200 rounded flex items-center justify-center mx-auto">
        <svg class="w-5 h-5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 class="text-sm font-medium text-dark-900 mt-3">No buckets match your search</h3>
      <p class="text-sm text-dark-700 mt-1">Try adjusting your search terms or clear the filter.</p>
      <button
        @click="searchQuery = ''"
        class="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 underline"
      >
        Clear search
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-10">
      <div class="w-10 h-10 bg-dark-200 rounded flex items-center justify-center mx-auto">
        <svg class="w-5 h-5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-sm font-medium text-dark-900 mt-3">No buckets found</h3>
      <p class="text-sm text-dark-700 mt-1">You don't have access to any S3 buckets or none exist in this account.</p>
    </div>
  </div>
</template>

<script>
import { s3Api } from '../services/api'

export default {
  name: 'Home',
  data() {
    return {
      buckets: [],
      loading: false,
      error: null,
      searchQuery: '',
      sortBy: 'name', // name, creationDate, objectCount
      sortOrder: 'asc', // asc, desc
      objectCounts: {} // bucket name -> object count
    }
  },
  mounted() {
    this.loadSettingsFromStorage()
    this.loadBuckets()
  },
  beforeUnmount() {
    this.saveSettingsToStorage()
  },
  computed: {
    filteredAndSortedBuckets() {
      let filtered = this.buckets
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(bucket => 
          bucket.Name.toLowerCase().includes(query)
        )
      }
      
      // Apply sorting
      return [...filtered].sort((a, b) => {
        let valueA, valueB
        
        switch (this.sortBy) {
          case 'name':
            valueA = a.Name.toLowerCase()
            valueB = b.Name.toLowerCase()
            break
          case 'creationDate':
            valueA = new Date(a.CreationDate)
            valueB = new Date(b.CreationDate)
            break
          case 'objectCount':
            valueA = this.objectCounts[a.Name] ?? -1
            valueB = this.objectCounts[b.Name] ?? -1
            break
          default:
            return 0
        }
        
        if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1
        if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    },
    hasActiveFiltersOrSort() {
      return this.searchQuery !== '' || this.sortBy !== 'name' || this.sortOrder !== 'asc'
    }
  },
  watch: {
    sortBy(newSortBy) {
      if (newSortBy === 'objectCount') {
        this.loadObjectCounts()
      }
      this.saveSettingsToStorage()
    },
    sortOrder() {
      this.saveSettingsToStorage()
    },
    searchQuery() {
      this.saveSettingsToStorage()
    }
  },
  methods: {
    async loadBuckets() {
      this.loading = true
      this.error = null
      
      try {
        const response = await s3Api.getBuckets()
        this.buckets = response.data
      } catch (error) {
        console.error('Error loading buckets:', error)
        this.error = error.response?.data?.error || 'Failed to load buckets'
      } finally {
        this.loading = false
      }
    },
    selectBucket(bucketName) {
      this.$router.push({ name: 'BucketView', params: { bucketName } })
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    },
    async loadObjectCounts() {
      // Load object counts for sorting (only for visible buckets to avoid too many requests)
      const visibleBuckets = this.buckets.slice(0, 20) // Limit to first 20 buckets for performance
      
      for (const bucket of visibleBuckets) {
        if (this.objectCounts[bucket.Name] === undefined) {
          try {
            const response = await s3Api.getObjects(bucket.Name, '', 1) // Just get count, limit to 1
            // Note: This gives us at least some indication of objects, though not exact count
            this.objectCounts[bucket.Name] = response.data.objects.length > 0 ? 
              (response.data.isTruncated ? '1000+' : response.data.objects.length) : 0
          } catch (error) {
            console.warn(`Failed to get object count for ${bucket.Name}:`, error)
            this.objectCounts[bucket.Name] = 'Error'
          }
        }
      }
    },
    resetFiltersAndSort() {
      this.searchQuery = ''
      this.sortBy = 'name'
      this.sortOrder = 'asc'
      this.saveSettingsToStorage()
    },
    saveSettingsToStorage() {
      const settings = {
        searchQuery: this.searchQuery,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder
      }
      localStorage.setItem('s3-browser-settings', JSON.stringify(settings))
    },
    loadSettingsFromStorage() {
      try {
        const stored = localStorage.getItem('s3-browser-settings')
        if (stored) {
          const settings = JSON.parse(stored)
          this.searchQuery = settings.searchQuery || ''
          this.sortBy = settings.sortBy || 'name'
          this.sortOrder = settings.sortOrder || 'asc'
        }
      } catch (error) {
        console.warn('Failed to load settings from storage:', error)
      }
    }
  }
}
</script>