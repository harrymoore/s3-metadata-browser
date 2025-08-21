<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <div>
                  <router-link to="/" class="text-gray-400 hover:text-gray-500">
                    <svg class="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span class="sr-only">Home</span>
                  </router-link>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="ml-4 text-sm font-medium text-gray-500">{{ bucketName }}</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-2xl font-bold text-gray-900">{{ bucketName }}</h1>
        </div>
        
        <!-- Search Toggle -->
        <div class="flex items-center space-x-4">
          <button
            @click="toggleSearch"
            :class="[
              'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              showSearch ? 'text-blue-700 bg-blue-100 hover:bg-blue-200' : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
            ]"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {{ showSearch ? 'Hide Search' : 'Search by Metadata' }}
          </button>
        </div>
      </div>

      <!-- Search Panel -->
      <SearchPanel 
        v-if="showSearch" 
        @search="handleSearch"
        @clear="handleClearSearch"
        class="mb-6"
      />

      <!-- Content -->
      <div class="bg-white shadow rounded-lg">
        <ObjectTable 
          :objects="objects"
          :loading="loading"
          :error="error"
          @refresh="loadObjects"
        />
      </div>
    </div>
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