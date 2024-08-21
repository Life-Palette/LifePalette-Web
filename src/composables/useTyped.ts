import { init } from 'ityped'

export default (strings: string[], callBack?: any) => {
  const typedRef = ref<Element>()

  onMounted(() => {
    init(typedRef.value!, {
      strings,
      showCursor: false,
      disableBackTyping: true,
      onFinished: callBack,
    })
  })
  return typedRef
}
