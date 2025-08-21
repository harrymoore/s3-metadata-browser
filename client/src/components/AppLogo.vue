<template>
  <div class="flex items-center space-x-2">
    <div class="relative">
      <!-- S3 Icon -->
      <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <!-- Metadata indicator -->
      <div class="absolute -top-1 -right-1 w-3 h-3 bg-warm-500 rounded-full border border-white"></div>
    </div>
    <div class="flex flex-col">
      <span class="text-base font-bold text-dark-900 leading-none">S3 Meta</span>
      <span class="text-xs font-medium text-dark-600 leading-none">Browser</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppLogo'
}
</script>
