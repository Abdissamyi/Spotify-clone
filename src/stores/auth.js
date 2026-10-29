import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/spotify'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  async function fetchUser() {
    if (user.value) return user.value
    try {
      user.value = await api.getMe()
    } catch (e) {
      console.error('getMe failed', e)
    }
    return user.value
  }

  return { user, fetchUser }
})
