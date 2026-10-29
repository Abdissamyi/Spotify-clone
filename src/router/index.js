import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../api/auth'
import AppShell from '../components/AppShell.vue'
import CallbackView from '../views/CallbackView.vue'
import HomeView from '../views/HomeView.vue'
import LibraryView from '../views/LibraryView.vue'
import LoginView from '../views/LoginView.vue'
import NotFoundView from '../views/NotFound.vue'
import SearchView from '../views/SearchView.vue'
import AlbumView from '../views/AlbumView.vue'
import ArtistView from '../views/ArtistView.vue'
import PlaylistView from '../views/PlaylistView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppShell,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'search', name: 'search', component: SearchView },
        { path: 'library', name: 'library', component: LibraryView },
        { path: 'album/:id', name: 'album', component: AlbumView },
        { path: 'artist/:id', name: 'artist', component: ArtistView },
        { path: 'playlist/:id', name: 'playlist', component: PlaylistView },
      ],
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/callback', name: 'callback', component: CallbackView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

router.beforeEach(to => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && isLoggedIn()) {
    return { name: 'home' }
  }
})

export default router
