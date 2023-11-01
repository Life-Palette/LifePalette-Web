<script setup>
import { apiGet, apiPost, getLogin } from "~/api/admin";
import { tagFindAll } from "~/api/tag";
import { topicFindAll } from "~/api/topic";
import { storeToRefs } from "pinia";
import { useUserStore } from "~/store/user";
import { ElMessage } from "element-plus";
import { Starport } from "vue-starport";
import StarportCard from "~/components/StarportCard.vue";
import ListSwiper from "~/components/List/ListSwiper.vue";
import LottieNoData from "~/components/Lottie/NoData.vue";
import Skeleton from "~/components/skeleton";
import CardSwiper from "~/components/Card/SwiperCard.vue";
import { formatTime } from "~/utils";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Keyboard,
  Mousewheel,
} from "swiper/modules";

// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from "swiper/vue";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/mousewheel";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";

const onSwiper = (swiper) => {
  console.log(swiper);
};
const onSlideChange = () => {
  console.log("slide change");
};

const modules = [Navigation, Scrollbar, A11y, Keyboard, Mousewheel];
const userStore = useUserStore();
const router = useRouter();
// 是否开启swiper布局
const isSwiperLayout = ref(false);

const { count } = storeToRefs(userStore);

// 获取公告
const getTestFunc = async () => {
  let params = {};

  const { code, result, msg } = await apiGet(params);

  if (code === 0 && result) {
    console.log("getTestFunc成功", result);
  } else {
    ElMessage({
      message: msg,
      type: "error",
    });
    console.log("getTestFunc失败", msg);
  }
};

onMounted(() => {
  getTestData();
  getTopicList();
});
const tagList = ref([]);
// get api test
const getTestData = async () => {
  const params = {
    sort: "asc,createdAt",
  };
  const { code, msg, result } = ({} = await tagFindAll(params));

  if (code === 200) {
    console.log("get api test成功", result);
    const { data = [] } = result;
    tagList.value = data;
    tagId.value = data[0].id;
  } else {
    console.log("get api test失败", msg);
  }
};
// post api test
const postTestData = async () => {
  const params = {};
  const { code, msg, result } = ({} = await apiPost(params));
  if (code === 0) {
    console.log("post api test成功", result);
  } else {
    console.log("post api test失败", msg);
  }
};
// login
const loginFunc = async () => {
  const params = {
    mobile: "",
    password: "",
  };
  const { code, msg, result } = ({} = await userStore.handLogin(params));
  if (code === 200) {
    console.log("post api test成功", result);
  } else {
    console.log("post api test失败", msg);
  }
};

const handleClick = (item) => {
  console.log("item", item);
  const { id } = item;
  tagId.value = id;
  getTopicList();
};
const tagId = ref("");
const topicList = ref([]);
// 获取话题列表
const getDataLoading = ref(false);
const getTopicList = async () => {
  getDataLoading.value = true;
  const params = {
    page: 1,
    size: 30,
    tagId: tagId.value,
    sort: "desc,createdAt",
  };
  const { code, msg, result } = ({} = await topicFindAll(params));
  if (code === 200) {
    console.log("getTopicList成功", result);
    const { data = [] } = result;
    topicList.value = data;
  } else {
    console.log("getTopicList失败", msg);
  }
  setTimeout(() => {
    getDataLoading.value = false;
  }, 500);
};

const goDe = (item) => {
  console.log("item", item);
  const { id, files } = item;
  const imgCover = files[0].file;
  console.log("imgCover", imgCover);
  router.push(`/detail/${id}?imgCover=${imgCover}`);
};
// 标签信息
const getTagDe = (tags) => {
  const tagNameList = tags || [];
  return tagNameList.map((item) => `#${item.title}`).join(" ");
};
</script>

<template>
  <div class="h-full w-full gap-0 flex flex-col">
    <!-- <h1>Hello Start demo!</h1> -->

    <!-- 标签列表 -->
    <div class="flex flex-wrap gap- px-10 relative items-center">
      <div
        class="relative flex items-center justify-center box-border rounded-md overflow-hidden cursor-pointer tag-list"
        v-for="(item, index) in tagList"
        :key="index"
        @click="handleClick(item)"
      >
        <div
          :class="[
            tagId === item.id
              ? isDark
                ? 'tag-item-active-dark'
                : 'tag-item-active '
              : '',
            isDark ? 'tag-item-dark' : 'tag-item',
          ]"
        >
          {{ item.title }}
        </div>
      </div>
      <!-- 测试图标 -->
      <div
        class="absolute right-0 bottom-6 flex items-center gap-1 cursor-pointer hover:text-blue"
        @click="isSwiperLayout = !isSwiperLayout"
      >
        {{ isSwiperLayout ? "列表模式" : "卡片模式" }}

        <div
          :class="[
            isSwiperLayout
              ? 'i-carbon-ibm-secure-infrastructure-on-vpc-for-regulated-industries'
              : 'i-carbon-show-data-cards',
          ]"
        ></div>
      </div>
    </div>

    <!-- 内容列表 -->
    <div
      class="px-10 box-border overflow-auto content-box"
      v-if="!getDataLoading"
    >
      <div class="w-full h-full rounded-md overflow-auto">
        <!-- 有数据 -->
        <template v-if="topicList.length > 0">
          <template v-if="isSwiperLayout">
            <swiper
              class="h-full"
              :modules="modules"
              :slides-per-view="1"
              :space-between="0"
              :pagination="{ clickable: true }"
              :keyboard="{ enabled: true }"
              :mousewheel="{ enabled: true }"
              @swiper="onSwiper"
              @slideChange="onSlideChange"
              direction="vertical"
            >
              <swiper-slide v-for="(item, index) in topicList" :key="index">
                <div
                  @click="goDe(item)"
                  class="w-full h-full relative cursor-pointer"
                >
                  <el-carousel :interval="5000" arrow="always">
                    <el-carousel-item v-for="item2 in item.files" :key="item">
                      <!-- <h3 text="2xl" justify="center">{{ item2 }}</h3> -->
                      <CardSwiper :data="item2" />
                    </el-carousel-item>
                  </el-carousel>
                  <!-- 信息 -->
                  <div class="card-info-detail text-[#fff]">
                    <div class="account-name">
                      @{{ item?.User?.name }}
                      <span>
                        ·
                        {{
                          formatTime(item.createdAt, "YYYY-MM-DD HH:mm")
                        }}</span
                      >
                    </div>
                    <div class="title">
                      {{ item.title }}
                      <span class="text-[#face15] ml-3">{{
                        getTagDe(item.tags)
                      }}</span>
                    </div>
                  </div>
                </div>
              </swiper-slide>
            </swiper>
          </template>
          <template v-else>
            <div
              v-masonry
              transition-duration="0.3s"
              gutter="30"
              item-selector=".itemT"
              class="container-box"
            >
              <div
                v-masonry-tile
                class="itemT"
                @click="goDe(item)"
                v-for="(item, index) in topicList"
              >
                <div class="w-80 min-h-50 item-box">
                  <div class="img-cover max-h-100 flex-1">
                    <Starport
                      :port="'my-id' + item.id"
                      class="w-full h-full transition-all duration-800"
                    >
                      <StarportCard :data="item.files[0]" />
                    </Starport>
                  </div>
                  <div class="content-desc">
                    <div class="content-desc-title">{{ item.title }}</div>
                    <div class="content-user">
                      <img
                        class="img-avatar"
                        object-cover
                        block
                        w-full
                        h-full
                        bg-gray-400:20
                        :src="item.User.avatar"
                      />
                      <div class="user-name">{{ item.User.name }}</div>
                    </div>
                  </div>
                  <div class="h-[30px]"></div>
                </div>
              </div>
            </div>
          </template>
        </template>
        <!-- 无数据 -->
        <template v-else>
          <LottieNoData />
        </template>
      </div>
    </div>
    <template v-else>
      <Skeleton :loading="getDataLoading" :gridCols="4" :count="3">
        <template #template>
          <el-skeleton-item
            variant="image"
            class="w-auto"
            style="height: 140px"
          />
          <div class="mt-2">
            <el-skeleton-item variant="p" class="w-1/2" />
            <div
              style="
                display: flex;
                align-items: center;
                justify-items: space-between;
              "
            >
              <el-skeleton-item variant="text" class="mr-8" />
              <el-skeleton-item variant="text" class="w-3/10" />
            </div>
          </div>
        </template>

        <template #default> </template>
      </Skeleton>
    </template>
  </div>
</template>

<style lang="less" scoped>
.tag-list {
  display: flex;
  // padding: 20px 0;
  padding-top: 30px;
  padding-bottom: 10px;
  .tag-item {
    font-size: 16px;
    color: rgba(51, 51, 51, 0.8);
    height: 40px;
    padding: 0 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    &-dark {
      font-size: 16px;
      color: rgba(51, 51, 51, 0.8);
      height: 40px;
      padding: 0 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: rgba(255, 255, 255, 0.8);
      &:hover {
        border-radius: 999px;
        color: #fff;
        background-color: #333;
      }
    }
    &-active {
      border-radius: 999px;
      color: #333;
      background-color: #f8f8f8;
      font-weight: 600;
      &-dark {
        border-radius: 999px;
        color: #fff;
        background-color: #333;
        font-weight: 600;
      }
    }
    &:hover {
      border-radius: 999px;
      color: #333;
      background-color: #f8f8f8;
    }
  }
}
.container-box {
  .itemT {
    cursor: pointer;
    // background: red;
    // max-height: 300px;
    // overflow: hidden;
    // &:hover {
    //   .item-box {
    //     box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    //   }
    // }
  }
  .item-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .img-cover {
    // height: 200px;
    // min-height: 200px;
    // max-height: 300px;
    border-radius: 10px;
    overflow: hidden;
    &:hover {
      //   box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
      // 遮罩层
      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        // background-color: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
      }
    }
  }
  .content-desc {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    .content-desc-title {
      text-align: left;
      font-weight: 500;
      font-size: 14px;
      // color: #333;
      // 最多显示两行
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .content-user {
      display: flex;
      align-items: center;
      gap: 6px;
      .img-avatar {
        width: 30px;
        height: 30px;
        border-radius: 20px;
        border: 0.5px solid #e6e6e6;
      }
      .user-name {
        color: #666;
        font-size: 16px;
      }
    }
  }
}
// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}
.content-box {
  // background: red;
  // height: calc(100% - 200px);
  // width: calc(100% - 200px);
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  border-radius: 10px;
}
:deep(.el-carousel) {
  height: 100%;
  .el-carousel__container {
    height: 100%;
  }
}

.card-info-detail {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  // background: red;
  padding: 16px 95px 16px 16px;
  z-index: 2;
  .account-name {
    width: 100%;
    display: flex;

    justify-content: flex-start;
    align-items: center;
    font-size: 24px;
    line-height: 34px;
    font-weight: 500;
    span {
      font-size: 16px;
      line-height: 22px;
      margin-left: 5px;
      margin-top: 5px;
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    }
  }
  .title {
    width: 100%;
    display: flex;

    justify-content: flex-start;
    font-size: 18px;
    line-height: 26px;
    font-weight: 400;
  }
}
</style>
