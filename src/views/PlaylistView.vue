<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TrackList from '../components/TrackList.vue'
import Icon from '../components/Icon.vue'
import * as api from '../api/spotify'
import { usePlayerStore } from '../stores/player'
import { bestImage } from '../utils'

const route = useRoute()
const player = usePlayerStore()
const playlist = ref(null)
const tracks = ref([])
const error = ref('')

onMounted(async () => {
  try {
    const [meta, items] = await Promise.all([api.getPlaylist(route.params.id), api.getPlaylistItems(route.params.id)])
    playlist.value = meta
    tracks.value = api.tracksFrom(items)
  } catch (e) {
    error.value = e.message
  }
})

const playAll = () => player.playContext(playlist.value.uri)
const playAt = (i, t) => player.playContext(playlist.value.uri, t.uri)
</script>

<template>
  <p v-if="error" class="muted">Could not load this playlist: {{ error }}</p>
  <template v-else-if="playlist">
    <header class="hero">
      <img v-if="playlist.images?.length" class="hero-art" :src="bestImage(playlist.images, 300)" alt="" />
      <div v-else class="hero-art hero-art--empty"><Icon name="music" :size="64" /></div>
      <div class="hero-text">
        <span class="hero-kind">Playlist</span>
        <h1 class="hero-title">{{ playlist.name }}</h1>
        <p v-if="playlist.description" class="hero-desc">{{ playlist.description }}</p>
        <p class="hero-meta">{{ playlist.owner?.display_name }} • {{ tracks.length }} songs</p>
      </div>
    </header>
    <div class="actions">
      <button class="big-play" aria-label="Play playlist" @click="playAll"><Icon name="play" :size="28" /></button>
    </div>
    <TrackList :tracks="tracks" @play="playAt" />
    <p v-if="!tracks.length" class="muted">No playable songs in this playlist.</p>
  </template>
  <p v-else class="muted">Loading…</p>
</template>
