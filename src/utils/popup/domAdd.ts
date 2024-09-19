import type {
  App,
  Component,
  ComputedOptions,
  MethodOptions,
  VNode,
  VNodeArrayChildren,
} from 'vue'
import { randomString } from '@iceywu/utils'
import {
  createApp,
  h,
  onBeforeUnmount,
} from 'vue'

interface RawSlots {
  [name: string]: unknown
  $stable?: boolean
}

type RawChildren =
  | string
  | number
  | boolean
  | VNode
  | VNodeArrayChildren
  | (() => any)

export interface IPopupOptions {
  rootComponent: Component<any, any, any, ComputedOptions, MethodOptions>
  rootProps?: Record<string, unknown> | null | undefined
  children?: RawChildren | RawSlots | undefined
}
export interface DomOptions {
	appendDom?: HTMLElement
	domSet?: (el: HTMLDivElement) => void

}
export function domAdd(container: Component<any, any, any, ComputedOptions, MethodOptions>, options?: DomOptions) {
  const el = document.createElement('div')
  const randomStr = randomString(16)
  el.setAttribute('id', randomStr)
  el.setAttribute('name', randomStr)
	const { appendDom = document.body, domSet } = options || {}

	if (domSet) {
		domSet(el)
	}

  const createMyApp = () => createApp(h(container))
  let app: App<Element>

  const add = () => {
    app = createMyApp()
    app.mount(el)
    appendDom.appendChild(el)
  }
  const destroy = () => {
    if (app) {
      app.unmount()
    }
    appendDom.removeChild(el)
  }
  const close = () => {
    destroy()
  }

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    add,
    destroy,
    close,
  }
}
