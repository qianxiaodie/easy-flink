import Vue from 'vue'
import { IMenuItem } from '@utils/types'
import UContextMenu from './context-menu.vue'

const ContextMenuConstructor = Vue.extend(UContextMenu)

const createContextMenu = (menuItems: IMenuItem[], callback: (item: IMenuItem, event: Event) => void) => {
  const propsData: any = {
    menuItems
  }
  const methods: any = {
    onClick(item: IMenuItem, event: Event) {
      if (item.disabled) {
        return
      }
      callback(item, event)
    }
  }
  const instance = new ContextMenuConstructor({
    propsData,
    methods
  })

  instance.vm = instance.$mount()
  document.body.appendChild(instance.vm.$el)
  // console.log(instance, '=======instanceeee')

  // instance.$el.style.cursor = 'not-allowed'
  // instance.$el.children[0].style.cursor = 'not-allowed'
  // console.log(instance.$el.children[0].style, 'instance=======')

  return instance
}

export default createContextMenu
