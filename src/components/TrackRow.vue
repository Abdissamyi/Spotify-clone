<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { fmtTime, bestImage } from '../utils'
import Icon from './Icon.vue'

const props = defineProps({
  track: { type: Object, required: true },
  index: Number,
  showAlbum: { type: Boolean, default: true },
  showArt: { type: Boolean, default: true },
})
const emit = defineEmits(['play'])

const player = usePlayerStore()
const active = computed(() => player.track?.id === props.track.id)
const playing = computed(() => active.value && player.isPlaying)
</script>

<template>
  <div class="track-row" :class="{ active, 'no-album': !showAlbum }" @dblclick="emit('play')">
    <div class="track-idx">
      <span class="num">{{ index }}</span>
      <button class="idx-play" :aria-label="`Play ${track.name}`" @click="emit('play')">
        <Icon :name="playing ? 'pause' : 'play'" :size="16" />
      </button>
    </div>
    <div class="track-main">
      <img v-if="showArt" class="track-art" :src="bestImage(track.album?.images, 64)" alt="" loading="lazy" />
      <div class="track-text">
        <div class="track-name">{{ track.name }}</div>
        <div class="track-artists">
          <template v-for="(a, i) in track.artists" :key="a.id || i">
            <RouterLink v-if="a.id" :to="`/artist/${a.id}`" class="hover-underline">{{ a.name }}</RouterLink>
            <span v-else>{{ a.name }}</span><span v-if="i < track.artists.length - 1">, </span>
          </template>
        </div>
      </div>
    </div>
    <div v-if="showAlbum" class="track-album">
      <RouterLink v-if="track.album?.id" :to="`/album/${track.album.id}`" class="hover-underline">{{ track.album.name }}</RouterLink>
    </div>
    <div class="track-dur">{{ fmtTime(track.duration_ms) }}</div>
  </div>
</template>
