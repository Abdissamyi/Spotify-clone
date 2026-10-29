<script setup>
import { ref, onMounted } from 'vue'
import Card from '../components/Card.vue'
import CardRow from '../components/CardRow.vue'
import * as api from '../api/spotify'
import { usePlayerStore } from '../stores/player'
import { bestImage, greeting, dedupe } from '../utils'

const player = usePlayerStore()
const playlists = ref([])
const recent = ref([])
const top = ref([])
const releases = ref([])
const loading = ref(true)

onMounted(async () => {
  // Chaque section est indépendante : si un endpoint est restreint, les autres s'affichent quand même
  const [pl, rc, tp, nr] = await Promise.allSettled([
    api.getMyPlaylists(12),
    api.getRecentlyPlayed(20),
    api.getTopTracks(10),
    api.getNewReleases(10),
  ])
  if (pl.status === 'fulfilled') playlists.value = (pl.value?.items || []).filter(Boolean)
  if (rc.status === 'fulfilled') recent.value = dedupe((rc.value?.items || []).map(i => i.track)).slice(0, 10)
  if (tp.status === 'fulfilled') top.value = tp.value?.items || []
  if (nr.status === 'fulfilled') releases.value = nr.value?.albums?.items || []
  loading.value = false
})

const artists = t => t.artists.map(a => a.name).join(', ')
</script>

<template>
  <h1 class="page-title">{{ greeting() }}</h1>

  <p v-if="loading" class="muted">Loading…</p>

  <CardRow v-if="playlists.length" title="Your playlists">
    <Card
      v-for="p in playlists" :key="p.id"
      :title="p.name" :subtitle="`By ${p.owner?.display_name || 'Spotify'}`"
      :image="bestImage(p.images)" :to="`/playlist/${p.id}`"
      @play="player.playContext(p.uri)"
    />
  </CardRow>

  <CardRow v-if="recent.length" title="Recently played">
    <Card
      v-for="t in recent" :key="t.id"
      :title="t.name" :subtitle="artists(t)"
      :image="bestImage(t.album?.images)" :to="`/album/${t.album.id}`"
      @play="player.playUris([t.uri])"
    />
  </CardRow>

  <CardRow v-if="top.length" title="Your top tracks">
    <Card
      v-for="t in top" :key="t.id"
      :title="t.name" :subtitle="artists(t)"
      :image="bestImage(t.album?.images)" :to="`/album/${t.album.id}`"
      @play="player.playUris([t.uri])"
    />
  </CardRow>

  <CardRow v-if="releases.length" title="New releases">
    <Card
      v-for="a in releases" :key="a.id"
      :title="a.name" :subtitle="a.artists.map(x => x.name).join(', ')"
      :image="bestImage(a.images)" :to="`/album/${a.id}`"
      @play="player.playContext(a.uri)"
    />
  </CardRow>

  <p v-if="!loading && !playlists.length && !recent.length && !top.length && !releases.length" class="muted">
    Nothing to show yet. Listen to something on Spotify or use Search.
  </p>
</template>
