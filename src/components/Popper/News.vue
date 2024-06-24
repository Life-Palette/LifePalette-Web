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

const msg = ref('')
</script>

<template>
  <VDropdown :distance="6">
    <div i-carbon-notification-new mt-1.5 icon-btn />

    <template #popper>
      4444444444444
    </template>
  </VDropdown>
</template>

<style lang="less" scoped></style>
