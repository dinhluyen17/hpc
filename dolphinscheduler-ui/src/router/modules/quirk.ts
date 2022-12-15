
import type { Component } from 'vue'
import utils from '@/utils'

// All TSX files under the views folder automatically generate mapping relationship
const modules = import.meta.glob('/src/views/**/**.tsx')
const components: { [key: string]: Component } = utils.mapping(modules)

export default {
  path: '/quirk',
  name: 'quirk',
  meta: { title: 'test quirk page' },
  component: () => import('@/layouts/content'),
  children: [
    {
      path: '',
      name: 'quirk',
      component: components['quirk'],
      meta: {
        title: 'test quirk page',
        activeMenu: 'quirk',
        showSide: false,
        auth: []
      }
    }
  ]
}
