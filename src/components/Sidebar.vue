<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from './Icon.vue'
import { getMyPlaylists } from '../api/spotify'
import { bestImage } from '../utils'

const playlists = ref([])

onMounted(async () => {
  try {
    const res = await getMyPlaylists(50)
    playlists.value = (res?.items || []).filter(Boolean)
  } catch (e) {
    console.error('playlists failed', e)
  }
})
</script>

<template>
  <aside class="sidebar">
    <nav class="panel nav">
      <RouterLink to="/" class="brand">
        <span class="brand-mark"><Icon name="music" :size="18" /></span>
        <span class="hide-sm">Soundwave</span>
      </RouterLink>
      <RouterLink to="/" class="nav-link" exact-active-class="active"><Icon name="home" /><span class="hide-sm">Home</span></RouterLink>
      <RouterLink to="/search" class="nav-link" active-class="active"><Icon name="search" /><span class="hide-sm">Search</span></RouterLink>
    </nav>

    <div class="panel library">
      <RouterLink to="/library" class="nav-link lib-head" active-class="active">
        <Icon name="library" /><span class="hide-sm">Your Library</span>
      </RouterLink>
      <div class="lib-list">
        <RouterLink v-for="p in playlists" :key="p.id" :to="`/playlist/${p.id}`" class="lib-item">
          <img v-if="p.images?.length" :src="bestImage(p.images, 64)" alt="" loading="lazy" />
          <span v-else class="lib-ph"><Icon name="music" :size="20" /></span>
          <span class="lib-text hide-sm">
            <span class="lib-name">{{ p.name }}</span>
            <span class="lib-sub">Playlist<template v-if="p.owner?.display_name"> • {{ p.owner.display_name }}</template></span>
          </span>
        </RouterLink>
      </div>
    </div>
  </aside>
</template>
