<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import TrackList from '../components/TrackList.vue'
import Icon from '../components/Icon.vue'
import * as api from '../api/spotify'
import { usePlayerStore } from '../stores/player'
import { bestImage } from '../utils'

const route = useRoute()
const player = usePlayerStore()
const album = ref(null)
const tracks = ref([])
const error = ref('')

onMounted(async () => {
  try {
    album.value = await api.getAlbum(route.params.id)
    // les tracks d'un album n'ont pas le champ "album" : on l'ajoute
    tracks.value = api.tracksFrom(album.value.tracks).map(t => ({ ...t, album: { id: album.value.id, name: album.value.name, images: album.value.images } }))
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <p v-if="error" class="muted">Could not load this album: {{ error }}</p>
  <template v-else-if="album">
    <header class="hero">
      <img class="hero-art" :src="bestImage(album.images, 300)" alt="" />
      <div class="hero-text">
        <span class="hero-kind">{{ album.album_type }}</span>
        <h1 class="hero-title">{{ album.name }}</h1>
        <p class="hero-meta">
          <template v-for="(a, i) in album.artists" :key="a.id">
            <RouterLink :to="`/artist/${a.id}`" class="hover-underline strong">{{ a.name }}</RouterLink><span v-if="i < album.artists.length - 1">, </span>
          </template>
          • {{ album.release_date?.slice(0, 4) }} • {{ tracks.length }} songs
        </p>
      </div>
    </header>
    <div class="actions">
      <button class="big-play" aria-label="Play album" @click="player.playContext(album.uri)"><Icon name="play" :size="28" /></button>
    </div>
    <TrackList :tracks="tracks" :show-album="false" :show-art="false" @play="(i, t) => player.playContext(album.uri, t.uri)" />
  </template>
  <p v-else class="muted">Loading…</p>
</template>
