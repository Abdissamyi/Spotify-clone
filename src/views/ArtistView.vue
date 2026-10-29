<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TrackList from '../components/TrackList.vue'
import Card from '../components/Card.vue'
import CardRow from '../components/CardRow.vue'
import Icon from '../components/Icon.vue'
import * as api from '../api/spotify'
import { usePlayerStore } from '../stores/player'
import { useAuthStore } from '../stores/auth'
import { bestImage } from '../utils'

const route = useRoute()
const player = usePlayerStore()
const auth = useAuthStore()
const artist = ref(null)
const tops = ref([])
const albums = ref([])
const error = ref('')

onMounted(async () => {
  try {
    artist.value = await api.getArtist(route.params.id)
  } catch (e) {
    error.value = e.message
    return
  }
  const market = (await auth.fetchUser())?.country || 'US'
  const [t, a] = await Promise.allSettled([api.getArtistTopTracks(route.params.id, market), api.getArtistAlbums(route.params.id)])
  if (t.status === 'fulfilled') tops.value = (t.value?.tracks || []).slice(0, 5)
  if (a.status === 'fulfilled') albums.value = a.value?.items || []
})
</script>

<template>
  <p v-if="error" class="muted">Could not load this artist: {{ error }}</p>
  <template v-else-if="artist">
    <header class="hero">
      <img v-if="artist.images?.length" class="hero-art round" :src="bestImage(artist.images, 300)" alt="" />
      <div v-else class="hero-art round hero-art--empty"><Icon name="user" :size="64" /></div>
      <div class="hero-text">
        <span class="hero-kind">Artist</span>
        <h1 class="hero-title">{{ artist.name }}</h1>
        <p v-if="artist.followers?.total" class="hero-meta">{{ artist.followers.total.toLocaleString() }} followers</p>
      </div>
    </header>
    <div class="actions">
      <button class="big-play" aria-label="Play artist" @click="player.playContext(artist.uri)"><Icon name="play" :size="28" /></button>
    </div>

    <section v-if="tops.length" class="section">
      <h2 class="section-title">Popular</h2>
      <TrackList :tracks="tops" @play="i => player.playUris(tops.map(t => t.uri), i)" />
    </section>

    <CardRow v-if="albums.length" title="Discography">
      <Card
        v-for="a in albums" :key="a.id"
        :title="a.name" :subtitle="`${a.release_date?.slice(0, 4)} • ${a.album_type}`"
        :image="bestImage(a.images)" :to="`/album/${a.id}`"
        @play="player.playContext(a.uri)"
      />
    </CardRow>
  </template>
  <p v-else class="muted">Loading…</p>
</template>
