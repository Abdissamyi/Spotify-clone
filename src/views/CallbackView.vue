<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { exchangeCode } from '../api/auth'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  const q = new URLSearchParams(window.location.search)
  if (q.get('error')) {
    error.value = q.get('error')
    return
  }
  try {
    await exchangeCode(q.get('code'), q.get('state'))
    router.replace('/')
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <div class="login">
    <div class="login-box">
      <p v-if="!error">Signing you in…</p>
      <template v-else>
        <p>Login failed: {{ error }}</p>
        <RouterLink to="/login" class="btn-green">Try again</RouterLink>
      </template>
    </div>
  </div>
</template>
