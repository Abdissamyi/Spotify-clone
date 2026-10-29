<script setup>
defineProps({ title: String })
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="card-grid"><slot /></div>
  </section>
</template>
