<script setup>
import { apiGet, apiPost, getLogin } from "~/api/admin";
import { tagFindAll } from "~/api/tag";
import { topicFindAll } from "~/api/topic";
import { storeToRefs } from "pinia";
import { useUserStore } from "~/store/user";
import { ElMessage } from "element-plus";
import { Starport } from "vue-starport";
import StarportCard from "~/components/StarportCard.vue";
const userStore = useUserStore();
const router = useRouter();

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
    size: 10,
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
  getDataLoading.value = false;
};

const goDe = (item) => {
  console.log("item", item);
  const { id, files } = item;
  const imgCover = files[0].file;
  console.log("imgCover", imgCover);
  router.push(`/detail/${id}?imgCover=${imgCover}`);
};
</script>

<template>
  <div class="h-full w-full gap-5 flex flex-col">
    <!-- <h1>Hello Start demo!</h1> -->

    <!-- 标签列表 -->
    <div class="flex flex-wrap gap-5 px-10">
      <div
        class="relative flex items-center justify-center box-border rounded-md overflow-hidden cursor-pointer tag-list"
        v-for="(item, index) in tagList"
        :key="index"
        @click="handleClick(item)"
      >
        <!-- <div class="box-border h-[100px] w-[100px]">
          <img
            class="h-[100px] w-[100px] object-cover"
            :src="item.cover"
            alt=""
          />
        </div> -->
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

        <!-- <div
          class="absolute w-[100px] h-[100px] bg-black opacity-50 z-98 rounded-md overflow-hidden"
        ></div> -->
      </div>
    </div>

    <!-- 内容列表 -->
    <div class="px-10 flex-1 box-border overflow-auto" v-if="!getDataLoading">
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
              <Starport :port="'my-id' + item.id" class="w-full h-full">
                <StarportCard :data="item.files[0]" />
              </Starport>
            </div>
            <div class="content-desc">
              <div class="content-desc-title">{{ item.content }}</div>
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
    </div>
  </div>
</template>

<style lang="less" scoped>
.tag-list {
  display: flex;
  padding: 30px 0;
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
</style>
