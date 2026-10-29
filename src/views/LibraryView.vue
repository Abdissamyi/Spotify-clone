<script setup>
import { ref, onMounted } from 'vue'
import TrackList from '../components/TrackList.vue'
import Card from '../components/Card.vue'
import * as api from '../api/spotify'
import { usePlayerStore } from '../stores/player'
import { bestImage } from '../utils'

const player = usePlayerStore()
const tab = ref('playlists')
const playlists = ref([])
const liked = ref([])
const error = ref('')

onMounted(async () => {
  const [p, l] = await Promise.allSettled([api.getMyPlaylists(50), api.getSavedTracks(50)])
  if (p.status === 'fulfilled') playlists.value = (p.value?.items || []).filter(Boolean)
  if (l.status === 'fulfilled') liked.value = api.tracksFrom(l.value)
  if (p.status === 'rejected' && l.status === 'rejected') error.value = p.reason.message
})
</script>

<template>
  <h1 class="page-title">Your Library</h1>
  <div class="chips">
    <button class="chip" :class="{ on: tab === 'playlists' }" @click="tab = 'playlists'">Playlists</button>
    <button class="chip" :class="{ on: tab === 'liked' }" @click="tab = 'liked'">Liked Songs</button>
  </div>
  <p v-if="error" class="muted">{{ error }}</p>

  <div v-if="tab === 'playlists'" class="card-grid">
    <Card
      v-for="p in playlists" :key="p.id"
      :title="p.name" :subtitle="`By ${p.owner?.display_name || 'Spotify'}`"
      :image="bestImage(p.images)" :to="`/playlist/${p.id}`"
      @play="player.playContext(p.uri)"
    />
  </div>

  <template v-else>
    <TrackList v-if="liked.length" :tracks="liked" @play="i => player.playUris(liked.map(t => t.uri), i)" />
    <p v-else class="muted">No liked songs found.</p>
  </template>
</template>
