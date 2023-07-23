<template>
  <div>
    <h1>test</h1>

    <button @click="toggleDark()" class="pal-btn">模式切换</button>
    <h1>status:{{ status }}</h1>
    <h1>data:{{ data }}</h1>
    <button @click="send('hello')" class="pal-btn">发送</button>
    <button @click="open()" class="pal-btn">打开</button>
    <button @click="close()" class="pal-btn">关闭</button>
  </div>
</template>

<script setup>
import { useWebSocket } from "@vueuse/core";

const { status, data, send, open, close } = useWebSocket("wss://192.168.3.13::3001");


</script>

<style lang="less" scoped>
@import "~/styles/global.css";
</style>
