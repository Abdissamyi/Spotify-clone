<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from './Icon.vue'
import { usePlayerStore } from '../stores/player'
import { fmtTime } from '../utils'

const p = usePlayerStore()
const pct = computed(() => (p.duration ? (p.position / p.duration) * 100 : 0))
const volPct = computed(() => p.volume * 100)
const art = computed(() => p.track?.album?.images?.[0]?.url)
</script>

<template>
  <footer class="player">
    <div class="np">
      <template v-if="p.track">
        <img v-if="art" class="np-art" :src="art" alt="" />
        <div class="np-meta">
          <span class="np-title">{{ p.track.name }}</span>
          <span class="np-artist">{{ p.track.artists.map(a => a.name).join(', ') }}</span>
        </div>
      </template>
      <span v-else class="np-hint">{{ p.error || (p.ready ? 'Pick something to play' : 'Connecting player…') }}</span>
    </div>

    <div class="controls">
      <div class="ctrl-btns">
        <button class="ctrl" aria-label="Previous" @click="p.previous()"><Icon name="prev" :size="20" /></button>
        <button class="ctrl-main" :aria-label="p.isPlaying ? 'Pause' : 'Play'" @click="p.togglePlay()">
          <Icon :name="p.isPlaying ? 'pause' : 'play'" :size="20" />
        </button>
        <button class="ctrl" aria-label="Next" @click="p.next()"><Icon name="next" :size="20" /></button>
      </div>
      <div class="progress">
        <span class="time">{{ fmtTime(p.position) }}</span>
        <input
          class="range"
          type="range"
          min="0"
          :max="p.duration || 1"
          :value="p.position"
          :style="{ '--pct': pct + '%' }"
          aria-label="Seek"
          @input="p.position = Number($event.target.value)"
          @change="p.seek(Number($event.target.value))"
        />
        <span class="time">{{ fmtTime(p.duration) }}</span>
      </div>
      <div v-if="p.track && p.error" class="player-err">{{ p.error }}</div>
    </div>

    <div class="vol">
      <Icon name="volume" :size="20" />
      <input
        class="range vol-range"
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="p.volume"
        :style="{ '--pct': volPct + '%' }"
        aria-label="Volume"
        @input="p.setVolume(Number($event.target.value))"
      />
    </div>
  </footer>
</template>
