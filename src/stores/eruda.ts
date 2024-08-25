import { acceptHMRUpdate, defineStore } from 'pinia'

export const useErudaStore = defineStore(
	'eruda',
	() => {
		const maxNum = 6
		const activeNum = ref(0)
		const activeEruda = computed(() => {
			return activeNum.value >= maxNum
		})
		const addActiveNum = () => {
			activeNum.value++
			if (activeNum.value >= maxNum) {
				localStorage.setItem('active-eruda', true)
				window.location.reload()
			}
		}
		const closeEruda = () => {
			activeNum.value = 0
			localStorage.setItem('active-eruda', false)
			window.location.reload()
		}
		const setActiveNum = () => {
			activeNum.value = 6
			localStorage.setItem('active-eruda', true)
		}

		return {
			activeEruda,
			activeNum,
			addActiveNum,
			closeEruda,
			setActiveNum,
		}
	},
	{
		persist: {
			key: 'pinia-eruda',
		},
	},
)

if (import.meta.hot)
	import.meta.hot.accept(acceptHMRUpdate(useErudaStore, import.meta.hot))
