<template>
  <div class="getPhoto-box">
    <div class="getPhoto-content">
      <div class="getPhoto-content-title">getPhoto</div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['update:isShow', 'func']);
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
});
onMounted(() => {});
// function
const func = () => {
  emit('func');
};
// function-update
const funcUpdate = () => {
  emit('update:isShow', false);
};
defineExpose({
  func,
});
</script>

<style lang="less" scoped>
.getPhoto {
  &-content {
    &-title {
      color: #000;
    }
  }
}
</style>