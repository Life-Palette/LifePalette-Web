/**
 * 用户访问相关的弹窗
 */
import { h } from 'vue'
import dialog from '~/components/image-viewer/index.vue'
import { domAdd } from './domAdd'

function domSet(el: HTMLDivElement) {
	el.setAttribute(
		'style',
		'position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 9999;',
	)
}

export function showPreView(options: any) {
	const { renderer, ...data } = options
	return new Promise((resolve, reject) => {
		let popupInstance: any
		const testDom = h(dialog as any, {
			data,
		})
		const handleClose = () => {
			popupInstance?.destroy()
		}
		const handleCancel = () => {
			popupInstance?.destroy()
			// eslint-disable-next-line prefer-promise-reject-errors
			reject('cancel')
		}
		const handleOk = () => {
			resolve({
				done:	popupInstance?.destroy,
			})
		}
		const done = () => {
			resolve({
				done:	popupInstance?.destroy,
				data,
			})
		}
		popupInstance = domAdd(
			h(
				testDom,
				{
					...data,
					onClose: handleClose,
					onOk: done,
					onCancel: handleCancel,
				},
				{
					header: renderer?.header,
					default: renderer?.default,
					footer: renderer?.footer,

				},

			),
			// { domSet },
		)
		popupInstance.add()
	})
}
