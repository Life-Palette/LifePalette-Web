<script setup>
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:isShow', 'func'])
onMounted(() => {})
// function
function func() {
  emit('func')
}
// function-update
function funcUpdate() {
  emit('update:isShow', false)
}
defineExpose({
  func,
})
</script>

<template>
  <div class="getPhoto-box">
    <div class="getPhoto-content">
      <div class="getPhoto-content-title">
        getPhoto
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.getPhoto {
	&-content {
		&-title {
			color: #000;
		}
	}
}
</style>
