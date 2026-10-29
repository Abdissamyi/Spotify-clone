<script setup>
import { onMounted } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import PlayerBar from './PlayerBar.vue'
import { usePlayerStore } from '../stores/player'
import { useAuthStore } from '../stores/auth'

const player = usePlayerStore()
const auth = useAuthStore()

onMounted(() => {
  auth.fetchUser()
  player.init()
})
</script>

<template>
  <div class="shell">
    <Sidebar />
    <main class="main panel">
      <TopBar />
      <div class="view">
        <RouterView :key="$route.fullPath" />
      </div>
    </main>
    <PlayerBar />
  </div>
</template>
