<template>
  <div class="space-y-6">
    <!-- Header with Breadcrumb -->
    <div class="flex items-center justify-between">
      <div class="min-w-0 flex-1">
        <nav class="flex items-center space-x-2 text-sm mb-2">
          <router-link 
            to="/" 
            class="text-secondary-500 hover:text-secondary-700 font-medium transition-colors"
          >
            Buckets
          </router-link>
          <svg class="w-4 h-4 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-secondary-700 font-semibold truncate">{{ bucketName }}</span>
        </nav>
        <h1 class="text-xl font-bold text-secondary-900">{{ bucketName }}</h1>
        <p class="text-sm text-secondary-600 mt-1">Objects and metadata</p>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-3">
        <button
          @click="toggleSearch"
          :class="[
            'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
            showSearch 
              ? 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200' 
              : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
          ]"
        >
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ showSearch ? 'Hide Filters' : 'Filter Objects' }}
        </button>
      </div>
    </div>

    <!-- Search Panel -->
    <SearchPanel 
      v-if="showSearch" 
      @search="handleSearch"
      @clear="handleClearSearch"
    />

    <!-- Content -->
    <ObjectTable 
      :objects="objects"
      :loading="loading"
      :error="error"
      @refresh="loadObjects"
    />
  </div>
</template>

<script>
import { s3Api } from '../services/api'
import ObjectTable from '../components/ObjectTable.vue'
import SearchPanel from '../components/SearchPanel.vue'

export default {
  name: 'BucketView',
  components: {
    ObjectTable,
    SearchPanel
  },
  props: {
    bucketName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      objects: [],
      loading: false,
      error: null,
      showSearch: false,
      isSearchMode: false
    }
  },
  mounted() {
    this.loadObjects()
  },
  watch: {
    bucketName() {
      this.loadObjects()
    }
  },
  methods: {
    async loadObjects() {
      this.loading = true
      this.error = null
      
      try {
        const response = await s3Api.getObjectsWithMetadata(this.bucketName, {
          limit: 50
        })
        this.objects = response.data.objects
        this.isSearchMode = false
      } catch (error) {
        console.error('Error loading objects:', error)
        this.error = error.response?.data?.error || 'Failed to load objects'
      } finally {
        this.loading = false
      }
    },
    async handleSearch(filters) {
      this.loading = true
      this.error = null
      
      try {
        const response = await s3Api.searchObjects(this.bucketName, filters)
        this.objects = response.data
        this.isSearchMode = true
      } catch (error) {
        console.error('Error searching objects:', error)
        this.error = error.response?.data?.error || 'Failed to search objects'
      } finally {
        this.loading = false
      }
    },
    handleClearSearch() {
      this.loadObjects()
    },
    toggleSearch() {
      this.showSearch = !this.showSearch
      if (!this.showSearch && this.isSearchMode) {
        this.handleClearSearch()
      }
    }
  }
}
</script>