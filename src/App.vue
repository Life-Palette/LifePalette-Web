<script setup>
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
let locale = ref(zhCn)
</script>

<template>
  <el-config-provider :locale="locale" namespace="el" size="small">
    <router-view />
  </el-config-provider>
</template>

<style lang="less">
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: #f5f5f5;
}
::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
