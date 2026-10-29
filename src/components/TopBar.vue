<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { useAuthStore } from '../stores/auth'
import { logout } from '../api/auth'
import { bestImage } from '../utils'

const router = useRouter()
const auth = useAuthStore()
const open = ref(false)
</script>

<template>
  <header class="topbar">
    <div class="topbar-nav">
      <button class="round-btn" aria-label="Go back" @click="router.back()"><Icon name="left" /></button>
      <button class="round-btn" aria-label="Go forward" @click="router.forward()"><Icon name="right" /></button>
    </div>
    <div class="user">
      <button class="user-btn" @click="open = !open" :aria-expanded="open">
        <img v-if="auth.user?.images?.length" :src="bestImage(auth.user.images, 64)" alt="" />
        <Icon v-else name="user" :size="18" />
        <span class="hide-sm">{{ auth.user?.display_name || 'Profile' }}</span>
      </button>
      <div v-if="open" class="menu">
        <button @click="logout()">Log out</button>
      </div>
    </div>
  </header>
</template>
