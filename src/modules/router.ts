import type { App } from 'vue'
import fileRoutes from '~pages'
import { setupLayouts } from 'virtual:meta-layouts'
import { createRouter, createWebHistory } from 'vue-router'

fileRoutes.push({
  path: '/',
  meta: {
    layout: 'file'
  },
  component: () => import('~/pages/file.vue')
}, {
  path: '/:storageKey/:fullpath(.*)*',
  meta: {
    layout: 'file'
  },
  props: true,
  component: () => import('~/pages/file.vue')
});

let routes = setupLayouts(fileRoutes);
routes.push({
  path: '/admin',
  redirect: '/admin/site-setting'
})
export const router = createRouter({
  routes: routes,
  history: createWebHistory(),
})

export default (app: App) => app.use(router)