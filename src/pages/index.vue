<script setup>
import { apiGet, apiPost, getLogin } from "~/api/admin";
import { tagFindAll } from "~/api/tag";
import { topicFindAll } from "~/api/topic";
import { storeToRefs } from "pinia";
import { useUserStore } from "~/store/user";
import { ElMessage } from "element-plus";
const userStore = useUserStore();

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
  const params = {};
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
const getTopicList = async () => {
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
};
</script>

<template>
  <div class="h-screen w-full gap-5">
    <h1>Hello Start demo!</h1>

    <!-- 标签列表 -->
    <div class="flex flex-wrap gap-5 px-10">
      <div
        class="relative flex items-center justify-center box-border rounded-md overflow-hidden cursor-pointer"
        v-for="(item, index) in tagList"
        :key="index"
        @click="handleClick(item)"
      >
        <div class="box-border h-[100px] w-[100px]">
          <img
            class="h-[100px] w-[100px] object-cover"
            :src="item.cover"
            alt=""
          />
        </div>
        <!-- <div class="absolute w-[100px] z-99 color-white w-[80%]">
          {{ item.title }}
        </div>
       
        <div
          class="absolute w-[100px] h-[100px] bg-black opacity-50 z-98 rounded-md overflow-hidden"
        ></div> -->
      </div>
    </div>

    <!-- 内容列表 -->
    <div
      mt-10
      grid="~ cols-1 sm:cols-2 md:cols-3 lg:cols-4 xl:cols-6"
      px-10
      justify-center
      gap-5
    >
      <div
        class=""
        v-for="(item, index) in topicList"
        :key="index"
        @click="handleClick(item)"
      >
        <div
          class="my-component"
          overflow-hidden
          w-full
          h-full
          transition-all
          duration-900
          relative
          select-none
        >
          <img
            object-cover
            block
            w-full
            h-full
            bg-gray-400:20
            :src="item.files[0].file"
          />
          <div
            absolute
            pt-5
            left-0
            right-0
            bottom-0
            bg-gradient-to-t
            from-black:40
            to-transparent
            text-white
            font-mono
            flex
            items-center
            justify-center
          >
            {{ item.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped></style>
