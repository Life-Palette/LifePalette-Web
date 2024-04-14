import type { Directive, DirectiveBinding } from 'vue'
const handleLinkData = function (values: string) {
	let str = values
	console.log('🍪-----str-----', str)
	const reg =
		/(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g
	let url = values.match(reg)
	if (url) {
		url.forEach((item: string) => {
			str = str.replace(item, `<a href="${item}" target="_blank">${item}</a>`)
		})
	}
	return str
}

export const message = {
	mounted(el: HTMLElement, binding: DirectiveBinding) {
		// console.log('🌳-----binding-----', binding)
		// console.log('🍪-----el-----', el)
		const { value } = binding
		console.log('🍧-----value-----', value)
		if (!value) return
		const conVal = handleLinkData(value + '')
		el.innerHTML = conVal
	},
	// updated(el: HTMLElement, binding: DirectiveBinding) {
	// 	// console.log("🐠-----el-----", el, binding);
	// 	const { value } = binding
	// 	console.log('🍧-----value-----', value)
	// 	if (!value) return
	// 	const conVal = handleLinkData(value)
	// 	el.innerHTML = conVal
	// },
}
