<template>
  <div class="flex flex-wrap w-full">
    <div
      class="item bg-red-400 flex items-center justify-center md:w-[30%] sm:w-[50%]"
    >
      1
    </div>
    <div
      class="item bg-red-400 flex items-center justify-center md:w-[30%] sm:w-[50%]"
    >
      2
    </div>
    <div
      class="item bg-red-400 flex items-center justify-center md:w-[30%] sm:w-[50%]"
    >
      3
    </div>
  </div>
  <!-- <div class="gap-10" grid="~ cols-1 sm:cols-2 md:cols-3  ">
    <div class="item bg-red-400 flex items-center justify-center">1</div>
    <div class="item bg-red-400 flex items-center justify-center">2</div>
    <div class="item bg-red-400 flex items-center justify-center">3</div>
  </div> -->
</template>

<script setup></script>

<style lang="less" scoped>
.box {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.box1 {
  display: grid;
}
@media only screen and (max-width: 600px) {
  background: red;
  grid-template-columns: repeat(1, 1fr);
}
</style>
