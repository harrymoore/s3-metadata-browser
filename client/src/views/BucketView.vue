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
          <span class="text-dark-800 font-semibold truncate">{{ bucketName }}</span>
        </nav>
        <h1 class="text-lg font-bold text-dark-900">{{ bucketName }}</h1>
        <p class="text-sm text-dark-700 mt-0.5">Objects and metadata</p>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <button
          @click="toggleSearch"
          :class="[
            'inline-flex items-center px-2 py-1.5 text-sm font-medium rounded border transition-colors',
            showSearch 
              ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700' 
              : 'bg-dark-50 text-dark-800 border-dark-400 hover:bg-dark-200'
          ]"
        >
          <svg class="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ showSearch ? 'Hide' : 'Filter' }}
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