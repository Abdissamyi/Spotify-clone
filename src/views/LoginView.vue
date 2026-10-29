<script setup>
import { ref } from 'vue'
import Icon from '../components/Icon.vue'
import { login } from '../api/auth'

const error = ref('')

async function startLogin() {
  error.value = ''
  try {
    await login()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Could not start Spotify login.'
  }
}
</script>

<template>
  <div class="login">
    <div class="login-box">
      <span class="brand-mark big"><Icon name="music" :size="36" /></span>
      <h1>Soundwave</h1>
      <p>Log in with your Spotify account to browse your music and play it here.</p>
      <button class="btn-green" @click="startLogin">Log in with Spotify</button>
      <p v-if="error" class="login-error" role="alert">{{ error }}</p>
      <small>Playback requires Spotify Premium.</small>
    </div>
  </div>
</template>
