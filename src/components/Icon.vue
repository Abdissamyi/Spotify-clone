<script setup>
defineProps({ name: { type: String, required: true }, size: { type: Number, default: 24 } })

const paths = {
  home: 'M12 2.8 2.5 10.4V21.5h7v-6.8h5v6.8h7V10.4z',
  search: 'M10.5 3a7.5 7.5 0 1 0 4.6 13.4l4.5 4.5 1.4-1.4-4.5-4.5A7.5 7.5 0 0 0 10.5 3zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z',
  library: 'M3.5 4h2v16h-2zM8.5 4h2v16h-2zM13.6 5.2l1.9-.6 4.2 15.1-1.9.6z',
  play: 'M7 4.2v15.6L20 12z',
  pause: 'M6 4h4.2v16H6zM13.8 4H18v16h-4.2z',
  next: 'M5.5 5v14L16 12zM17 5h2v14h-2z',
  prev: 'M18.5 5v14L8 12zM5 5h2v14H5z',
  volume: 'M3 9.2v5.6h4l5 4V5.2l-5 4zM15.3 8.3a5 5 0 0 1 0 7.4l-1.3-1.5a3 3 0 0 0 0-4.4z',
  music: 'M9 3v12.2a3.6 3.6 0 1 0 2 3.3V8h8V3z',
  left: 'M15 4.5 7.5 12 15 19.5l1.4-1.4L10.3 12l6.1-6.1z',
  right: 'M9 4.5 16.5 12 9 19.5l-1.4-1.4 6.1-6.1-6.1-6.1z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v5.2l3.9 2.3-1 1.7L11 13V7z',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z',
}
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path :d="paths[name]" fill-rule="evenodd" />
  </svg>
</template>
