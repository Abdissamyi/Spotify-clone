<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '../components/Card.vue'
import CardRow from '../components/CardRow.vue'
import TrackRow from '../components/TrackRow.vue'
import Icon from '../components/Icon.vue'
import * as api from '../api/spotify'
import { usePlayerStore } from '../stores/player'
import { bestImage } from '../utils'

const route = useRoute()
const router = useRouter()
const player = usePlayerStore()

const q = ref(route.query.q || '')
const results = ref(null)
const loading = ref(false)
const error = ref('')
let timer

async function run() {
  const term = q.value.trim()
  if (!term) {
    results.value = null
    return
  }
  loading.value = true
  error.value = ''
  try {
    results.value = await api.search(term)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(q, v => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    router.replace({ query: v ? { q: v } : {} })
    run()
  }, 300)
})

onMounted(run)

const clean = arr => (arr?.items || []).filter(Boolean)
</script>

<template>
  <div class="searchbox">
    <Icon name="search" :size="20" />
    <input v-model="q" type="search" placeholder="What do you want to play?" aria-label="Search" autofocus />
  </div>

  <p v-if="loading" class="muted">Searching…</p>
  <p v-if="error" class="muted">{{ error }}</p>
  <p v-if="!results && !loading" class="muted">Search for songs, artists, albums and playlists.</p>

  <template v-if="results">
    <section v-if="clean(results.tracks).length" class="section">
      <h2 class="section-title">Songs</h2>
      <TrackRow
        v-for="(t, i) in clean(results.tracks)" :key="t.id"
        :track="t" :index="i + 1"
        @play="player.playUris(clean(results.tracks).map(x => x.uri), i)"
      />
    </section>

    <CardRow v-if="clean(results.artists).length" title="Artists">
      <Card
        v-for="a in clean(results.artists)" :key="a.id" round
        :title="a.name" subtitle="Artist"
        :image="bestImage(a.images)" :to="`/artist/${a.id}`"
        @play="player.playContext(a.uri)"
      />
    </CardRow>

    <CardRow v-if="clean(results.albums).length" title="Albums">
      <Card
        v-for="a in clean(results.albums)" :key="a.id"
        :title="a.name" :subtitle="a.artists.map(x => x.name).join(', ')"
        :image="bestImage(a.images)" :to="`/album/${a.id}`"
        @play="player.playContext(a.uri)"
      />
    </CardRow>

    <CardRow v-if="clean(results.playlists).length" title="Playlists">
      <Card
        v-for="p in clean(results.playlists)" :key="p.id"
        :title="p.name" :subtitle="`By ${p.owner?.display_name || 'Spotify'}`"
        :image="bestImage(p.images)" :to="`/playlist/${p.id}`"
        @play="player.playContext(p.uri)"
      />
    </CardRow>
  </template>
</template>
