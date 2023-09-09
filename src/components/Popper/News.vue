<template>
  <VDropdown :distance="6">
    <div icon-btn i-carbon-notification-new mt-1.5 />

    <template #popper> 4444444444444 </template>
  </VDropdown>
</template>

<script setup>
const emit = defineEmits(["update:isShow", "func"]);
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
});
onMounted(() => {});
// function
const func = () => {
  emit("func");
};
// function-update
const funcUpdate = () => {
  emit("update:isShow", false);
};
defineExpose({
  func,
});

const msg = ref("");
</script>

<style lang="less" scoped></style>
