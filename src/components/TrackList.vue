<script setup>
import TrackRow from './TrackRow.vue'
import Icon from './Icon.vue'

defineProps({ tracks: { type: Array, required: true }, showAlbum: { type: Boolean, default: true }, showArt: { type: Boolean, default: true } })
const emit = defineEmits(['play'])
</script>

<template>
  <div class="tracklist">
    <div class="track-head" :class="{ 'no-album': !showAlbum }">
      <span>#</span>
      <span>Title</span>
      <span v-if="showAlbum">Album</span>
      <span class="track-dur"><Icon name="clock" :size="16" /></span>
    </div>
    <TrackRow
      v-for="(t, i) in tracks" :key="t.id + i"
      :track="t" :index="i + 1" :show-album="showAlbum" :show-art="showArt"
      @play="emit('play', i, t)"
    />
  </div>
</template>
