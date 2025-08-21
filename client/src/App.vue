<template>
  <div id="app" class="min-h-screen bg-secondary-50">
    <nav class="bg-white border-b border-secondary-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <div class="flex items-center">
            <AppLogo />
            <div class="ml-6 h-6 w-px bg-secondary-300"></div>
            <div class="ml-6">
              <nav class="flex space-x-1">
                <router-link 
                  to="/" 
                  class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                  :class="$route.name === 'Home' ? 
                    'bg-primary-100 text-primary-700' : 
                    'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'"
                >
                  Buckets
                </router-link>
              </nav>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-xs text-secondary-500 font-mono">
              AWS S3
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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