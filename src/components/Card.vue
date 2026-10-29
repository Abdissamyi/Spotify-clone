<script setup>
import { RouterLink } from 'vue-router'
import Icon from './Icon.vue'

defineProps({
  title: String,
  subtitle: String,
  image: String,
  to: [String, Object],
  round: Boolean,
})
const emit = defineEmits(['play'])
</script>

<template>
  <div class="card">
    <component :is="to ? RouterLink : 'div'" :to="to" class="card-link" @click="!to && emit('play')">
      <div class="card-img-wrap">
        <img v-if="image" :src="image" :alt="title" class="card-img" :class="{ round }" loading="lazy" />
        <div v-else class="card-img card-img--empty" :class="{ round }"><Icon name="music" :size="40" /></div>
        <button class="card-play" :aria-label="`Play ${title}`" @click.prevent.stop="emit('play')">
          <Icon name="play" :size="24" />
        </button>
      </div>
      <div class="card-title">{{ title }}</div>
      <div class="card-sub">{{ subtitle }}</div>
    </component>
  </div>
</template>
