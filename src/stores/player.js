import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/spotify'
import { getAccessToken } from '../api/auth'

export const usePlayerStore = defineStore('player', () => {
  const deviceId = ref(null)
  const ready = ref(false)
  const error = ref('')
  const track = ref(null)
  const isPlaying = ref(false)
  const position = ref(0)
  const duration = ref(0)
  const volume = ref(0.5)

  let player = null
  let initialization
  let lastTick = 0

  function loadSdk() {
    if (window.Spotify) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const scriptUrl = 'https://sdk.scdn.co/spotify-player.js'
      let script = document.querySelector(`script[src="${scriptUrl}"]`)
      const timeout = window.setTimeout(() => {
        reject(new Error('Spotify player SDK did not load in time.'))
      }, 15_000)

      window.onSpotifyWebPlaybackSDKReady = () => {
        window.clearTimeout(timeout)
        resolve()
      }

      if (!script) {
        script = document.createElement('script')
        script.src = scriptUrl
        document.head.appendChild(script)
      }
      script.addEventListener(
        'error',
        () => {
          window.clearTimeout(timeout)
          reject(new Error('Could not load the Spotify player SDK.'))
        },
        { once: true },
      )
    })
  }

  async function init() {
    if (player) return
    if (initialization) return initialization

    initialization = (async () => {
      try {
        await loadSdk()
        if (!window.Spotify?.Player) throw new Error('Spotify player SDK is unavailable.')

        player = new window.Spotify.Player({
          name: 'Soundwave Web Player',
          getOAuthToken: callback => {
            getAccessToken()
              .then(callback)
              .catch(reason => {
                error.value = reason instanceof Error ? reason.message : 'Could not get a Spotify access token.'
              })
          },
          volume: volume.value,
        })

        player.addListener('ready', ({ device_id }) => {
          deviceId.value = device_id
          ready.value = true
          error.value = ''
        })
        player.addListener('not_ready', () => {
          ready.value = false
        })
        player.addListener('initialization_error', reason => {
          error.value = reason.message
        })
        player.addListener('authentication_error', reason => {
          error.value = reason.message
        })
        player.addListener('account_error', () => {
          error.value = 'Spotify Premium is required to play music here.'
        })
        player.addListener('playback_error', reason => {
          error.value = reason.message
        })
        player.addListener('player_state_changed', state => {
          if (!state) return
          track.value = state.track_window.current_track
          isPlaying.value = !state.paused
          position.value = state.position
          duration.value = state.duration
          lastTick = performance.now()
        })

        const connected = await player.connect()
        if (!connected) throw new Error('Could not connect to the Spotify player.')

        window.setInterval(() => {
          const now = performance.now()
          if (isPlaying.value) position.value = Math.min(duration.value, position.value + (now - lastTick))
          lastTick = now
        }, 500)
      } catch (reason) {
        player = null
        error.value = reason instanceof Error ? reason.message : 'Could not initialize the Spotify player.'
      }
    })()

    try {
      await initialization
    } finally {
      initialization = undefined
    }
  }

  async function play(body) {
    if (!deviceId.value) {
      error.value = 'Player not ready yet. Wait a second and try again.'
      return
    }
    try {
      await player.activateElement?.()
      await api.startPlayback(body, deviceId.value)
      error.value = ''
    } catch (reason) {
      error.value =
        reason?.status === 403
          ? 'Spotify Premium is required to play music.'
          : reason instanceof Error
            ? reason.message
            : 'Could not start playback.'
    }
  }

  function runPlayerCommand(command) {
    if (!player) return
    Promise.resolve()
      .then(command)
      .catch(reason => {
        error.value = reason instanceof Error ? reason.message : 'Spotify player command failed.'
      })
  }

  const playUris = (uris, offset = 0) => play({ uris, offset: { position: offset } })
  const playContext = (uri, offsetUri) =>
    play({ context_uri: uri, ...(offsetUri ? { offset: { uri: offsetUri } } : {}) })

  const togglePlay = () => runPlayerCommand(() => player.togglePlay())
  const next = () => runPlayerCommand(() => player.nextTrack())
  const previous = () => runPlayerCommand(() => player.previousTrack())
  const seek = ms => {
    position.value = ms
    runPlayerCommand(() => player.seek(ms))
  }
  const setVolume = value => {
    volume.value = value
    runPlayerCommand(() => player.setVolume(value))
  }

  return {
    deviceId,
    ready,
    error,
    track,
    isPlaying,
    position,
    duration,
    volume,
    init,
    playUris,
    playContext,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
  }
})
