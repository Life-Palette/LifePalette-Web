<script setup>
import PostForm from "~/components/post/index.vue";
import { useUserStore } from "~/store/user";
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
// 是否登录
const isLogin = computed(() => {
  return userInfo.value?.name;
});
onMounted(() => {});
const chooseIndex = ref(0);
const sliderList = ref([
  {
    name: "发现",
    // path: "/home/find",
    path: "/",
    icon: "i-carbon-search",
  },
  {
    name: "发布",
    // path: "/home/friend",
    path: "",
    icon: "i-carbon-add-alt",
  },
  {
    name: "我的",
    // path: "/home/my",
    path: "/mine",
    icon: "i-carbon-person",
  },
]);

const showTabList = computed(() => {
  if (isLogin.value) {
    return sliderList.value;
  } else {
    return sliderList.value.filter((item) => item.name == "发现");
  }
});
const isShowDialog = ref(false);
const clickTab = (item, index) => {
  chooseIndex.value = index;
  console.log("clickTab", item, index);
  const { name } = item;
  if (name === "发布") {
    isShowDialog.value = true;
  }
};
</script>

<template>
  <div class="slider">
    <div class="slider__list">
      <div
        class="slider__item"
        :class="[
          isDark ? 'slider__item-dark' : '',
          index === chooseIndex ? 'bg-[#f8f8f8] dark:bg-[#333]' : ' ',
        ]"
        v-for="(item, index) in showTabList"
        :key="index"
        @click="clickTab(item, index)"
      >
        <router-link
          :to="item.path"
          class="slider__link"
          :class="isDark ? 'slider__link-dark' : ''"
        >
          <div class="slider__icon" :class="item.icon">🐇</div>
          <div class="slider__name">{{ item.name }}</div>
        </router-link>
      </div>
    </div>
  </div>
  <PostForm v-if="isShowDialog" v-model:isShowDialog="isShowDialog" />
</template>

<style lang="less" scoped>
.slider {
  width: 14rem;
  height: 100%;
  // background-color: #fff;

  box-sizing: border-box;
  padding-top: 35px;

  .slider__list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    .slider__item {
      // height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      // align-items: center;
      display: flex;
      width: 100%;
      height: 48px;
      cursor: pointer;
      border-radius: 999px;
      box-sizing: border-box;
      padding: 0 16px;
      color: #333;
      &:hover {
        background: #f8f8f8;
      }
      // &-active {
      //   // background: #f8f8f8;
      //   &-dark {
      //     background: #333;
      //   }
      // }
      &-dark {
        // background: #333 !important;
        .slider__name {
          color: #fff !important;
        }

        &:hover {
          background: #333 !important;
        }
      }

      .slider__link {
        display: flex;
        gap: 10px;
        // justify-content: center;
        align-items: center;
        // 去除a标签下划线
        text-decoration: none;
        .slider__icon {
          font-size: 20px;
          // width: 40px;
          // height: 40px;
          // margin-bottom: 5px;
        }
        .slider__name {
          white-space: nowrap;
          font-size: 16px;
        }
      }
    }
  }
}
</style>
