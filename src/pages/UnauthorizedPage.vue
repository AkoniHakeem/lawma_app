<template>
  <div
    class="fullscreen bg-accent text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">🔒</div>

      <div class="text-h2" style="opacity: 0.4">Access Denied</div>

      <div class="text-h5 q-mt-md">
        You don't have permission to access this page.
      </div>

      <div class="text-body1 q-mt-md" style="opacity: 0.7">
        Please contact your administrator if you believe this is an error.
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="accent"
        unelevated
        to="/dashboard"
        label="Go to Dashboard"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Empty setup - this is a simple static page
</script>
