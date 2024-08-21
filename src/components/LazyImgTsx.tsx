const props = {
  loading: {
    type: String as PropType<'lazy' | 'eager'>,
    default: 'lazy',
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%',
  },
  height: {
    type: [String, Number] as PropType<string | number>,
    default: '100%',
  },
  isImgMode: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  src: {
    type: String as PropType<string>,
    default: '',
  },
  preSrc: {
    type: String as PropType<string>,
    default: '',
  },
}

export default defineComponent({
  name: 'LazyImg',
  props,
  emits: ['refresh', 'search', 'resetForm'],
  setup(props, { emit, slots, attrs }) {
    const isLoaded = ref(false)
    const isLoading = ref(true)
    const domTag = props.isImgMode ? 'img' : 'div'
    const blurNumber = ref(30)
    onMounted(() => {
      const img = document.createElement('img')
      img.onload = (e: any) => {
        isLoaded.value = true
        startDecreaseBlurNumber()
      }
      img.src = props.src
    })

    // 递减
    const decreaseBlurNumber = () => {
      if (blurNumber.value > 0) {
        blurNumber.value -= 5
      }
      else {
        isLoaded.value = true
        clearInterval(IntervalObj.value)
      }
    }
    const IntervalObj = ref<any>(null)
    // 开始递减mein
    const startDecreaseBlurNumber = () => {
      if (IntervalObj.value) {
        clearInterval(IntervalObj.value)
      }
      IntervalObj.value = setInterval(() => {
        decreaseBlurNumber()
      }, 200)
    }
    const onLoadPreImg = () => {
      isLoaded.value = false
      isLoading.value = false
      // console.log('🍪------------------------------>');
    }
    // 未加载
    const preLoadDom = () => {
      return h(domTag, {
        ...attrs,
        ...(props.isImgMode
          ? {
              src: props.preSrc,
              loading: props.loading,
              style: {
                width: props.width,
                height: props.height,
                filter: `blur(${blurNumber.value}px)`,
              },
              onLoad: onLoadPreImg,
            }
          : {
              style: {
                width: props.width,
                height: props.height,
                backgroundImage: `url(${props.preSrc})`,
                backgroundSize: 'cover',
                // transition: 'all 0.4s',
                // backgroundFilter: `blur(${blurNumber.value}px)`,
              },
            }),
      })
    }
    // 加载完成
    const loadedDom = () => {
      return h(domTag, {
        ...attrs,
        ...(props.isImgMode
          ? {
              src: props.src,
              loading: props.loading,
              style: {
                width: props.width,
                height: props.height,
                filter: `blur(${blurNumber.value}px)`,
              },
            }
          : {
              style: {
                width: props.width,
                height: props.height,
                backgroundImage: `url(${props.src})`,
                backgroundSize: 'cover',
                // transition: 'all 0.4s',
                // backgroundFilter: `blur(${blurNumber.value}px)`,
              },
            }),
      })
    }
    // 未加载
    const loadingDom = () => {
      return h('div', {
        class:
					'bg-[#f5f7fa] dark:bg-[#262727] absolute top-0 leff-0 h-full w-full z-9',
      })
    }

    return () => (
      <div
        class="relative overflow-hidden"
        style={{
          width: props.width,
          height: props.height,
        }}
      >
        111-
        {isLoading.value}
        {isLoading.value ? loadingDom() : null}
        {isLoaded.value ? loadedDom() : preLoadDom()}
      </div>
    )
  },
})
