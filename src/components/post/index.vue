<script setup>
import PostBase from '~/components/post/base.vue'

const dialogVisible = ref(true)
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    class="no-dlg-bg-class"
    append-to-body
    title="Tips"
    width="600px"
    top="8vh"
    :z-index="99999"
    @close="closeDialog"
  >
  <PostBase v-model:isShowDialog="dialogVisible" />
  </el-dialog>
</template>
