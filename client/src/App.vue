<template>
  <div id="app" class="min-h-screen bg-dark-50">
    <nav class="bg-white border-b border-dark-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-12">
          <div class="flex items-center">
            <AppLogo />
            <div class="ml-4 h-4 w-px bg-dark-200"></div>
            <div class="ml-4">
              <nav class="flex space-x-1">
                <router-link 
                  to="/" 
                  class="px-2 py-1 text-sm font-medium rounded transition-colors"
                  :class="$route.name === 'Home' ? 
                    'bg-primary-600 text-white' : 
                    'text-dark-600 hover:text-dark-900 hover:bg-dark-100'"
                >
                  Buckets
                </router-link>
              </nav>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <div class="text-xs text-dark-500 font-mono">
              AWS S3
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <router-view />
    </main>
  </div>
</template>

<script>
import AppLogo from './components/AppLogo.vue'

export default {
  name: 'App',
  components: {
    AppLogo
  }
}
</script>