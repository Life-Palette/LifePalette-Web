<script setup>
import { Starport } from "vue-starport";
import StarportCard from "~/components/StarportCard.vue";
import BaseLike from "~/components/Base/Like.vue";
import { topicFindById } from "~/api/topic";
import { commentCreate, commentFindById } from "~/api/comment";
import { likeCreate, likeFindById, likeDelete } from "~/api/like";
import { messageCreate } from "~/api/message";
import { formatTime } from "~/utils";
import { ElMessage } from "element-plus";
import { useUserStore } from "~/store/user";
const userStore = useUserStore();

const { userInfo } = storeToRefs(userStore);

const route = useRoute();
const router = useRouter();
const deId = ref("");
const dataDe = ref({});

const commentContent = ref("");
const tempFileUrl = ref("");

const fileList = ref([]);
// 获取内容详情
const getDataDe = async () => {
  const parsms = {
    topicId: deId.value,
  };
  isLogin.value && (parsms.userId = userInfo.value.id);
  const { code, msg, result } = ({} = await topicFindById(parsms));
  if (code === 200) {
    console.log("获取内容详情成功", result);
    dataDe.value = result;
    setTimeout(() => {
      fileList.value = result?.files || [];
      console.log("fileList.value", fileList.value);
    }, 500);
  } else {
    console.log("获取内容详情失败", msg);
  }
};

const onSwiper = (swiper) => {
  console.log(swiper);
};
const onSlideChange = () => {
  console.log("slide change");
};
const isInitDone = ref(false);
onMounted(() => {
  isInitDone.value = false;
  const { id } = route.params;
  const { imgCover } = route.query;
  // fileList.value = [{ file: imgCover, fileType: "IMAGE", thumbnail: imgCover }];
  fileList.value = [
    {
      file: imgCover,
      fileType: "IMAGE",
      thumbnail: imgCover,
    },
  ];
  deId.value = id;
  isInitDone.value = true;
  getDataDe();
  getLikeData();
  // getCommentData();
});

// 发送评论
const sendLoading = ref(false);
const handleSendComment = async () => {
  if (!commentContent.value || sendLoading.value) return;
  sendLoading.value = true;
  const params = {
    content: commentContent.value,
    topicId: deId.value,
  };
  const { code, msg, result } = ({} = await commentCreate(params));
  if (code === 200) {
    console.log("获取内容详情成功", result);
    commentContent.value = "";
    getCommentData();
  } else {
    console.log("获取内容详情失败", msg);
  }
  sendLoading.value = false;
};
// 消息创建
const handleMessageCreate = async () => {
  const params = {
    receiverId: dataDe.value.userId,
    content: "点赞了你的文章",
    objId: deId.value,
    type:'like'
  };
  const { code, msg, result } = ({} = await messageCreate(params));
  if (code === 200) {
    console.log("消息创建成功", result);
  } else {
    console.log("消息创建失败", msg);
  }
};

const commentRef = ref(null);
// 获取评论
const getCommentData = async () => {
  if (!commentRef.value) return;
  await commentRef.value.getCommentData();
};
const comList = ref([]);
const comNum = computed(() => {
  return comList.value.length || 0;
});

const handleLike = async () => {
  const params = {
    topicId: deId.value,
  };
  const requestApi = dataDe.value.like ? likeDelete : likeCreate;
  const { code, msg, result } = ({} = await requestApi(params));
  if (code === 200) {
    console.log("点赞成功", result);

    // getLikeData();
    if (dataDe.value.like) {
      dataDe.value.like = false;
      likeList.value = likeList.value.filter(
        (item) => item.userId !== userInfo.value.id
      );
    } else {
      dataDe.value.like = true;
      likeList.value.push({
        userId: userInfo.value.id,
        topicId: deId.value,
      });
      ElMessage.success("点赞成功");
      // 消息创建
      handleMessageCreate();
    }
  } else {
    console.log("点赞失败", msg);
    ElMessage.error("点赞失败");
  }
};
// 是否登录
const isLogin = computed(() => {
  return userInfo.value?.name;
});
// 获取点赞信息
const likeList = ref([]);
const getLikeData = async () => {
  const { code, msg, result } = ({} = await likeFindById({
    topicId: deId.value,
  }));
  if (code === 200) {
    console.log("获取点赞信息成功", result);
    likeList.value = result || [];
  } else {
    console.log("获取点赞信息失败", msg);
  }
};
// 标签信息
const tagDe = computed(() => {
  const tagNameList = dataDe.value?.tags || [];
  return tagNameList.map((item) => `#${item.title}`).join(" ");
});

const currentPlayIndex = ref(0);
const handleSwiperChange = (index) => {
  // console.log("index", index);
  currentPlayIndex.value = index;
};
const currentPlayInfo = computed(() => {
  return `${currentPlayIndex.value + 1}/${fileList.value.length}`;
});
</script>

<template>
  <div class="h-full w-full gap-5 flex px-10 pt-10 pb-2 box-border">
    <div class="conten-box">
      <div class="img-con flex-1 relative">
        <div v-if="fileList.length > 0" class="fraction">
          {{ currentPlayInfo }}
        </div>
        <Starport :port="'my-id' + deId" style="height: 100%">
          <div class="h-full relative">
            <el-carousel :autoplay="false" @change="handleSwiperChange">
              <el-carousel-item v-for="(item, index) in fileList" :key="index">
                <StarportCard :data="item" isDetail />
              </el-carousel-item>
            </el-carousel>
          </div>
        </Starport>
      </div>
      <div class="de-content flex-1 bg-[#fff]">
        <!-- 用户信息 -->
        <section>
          <div class="content-user">
            <img
              class="img-avatar"
              object-cover
              block
              w-full
              h-full
              bg-gray-400:20
              :src="dataDe?.User?.avatar"
            />
            <div class="user-name">{{ dataDe?.User?.name }}</div>
          </div>
        </section>
        <!-- 标题 -->
        <section class="title-part flex-1 overflow-auto flex flex-col">
          <!-- 标题 -->
          <div class="title-desc py-5">
            {{ dataDe.title }}
          </div>
          <!-- 内容 -->
          <div class="title-content text-start text-[#333] py-5">
            {{ dataDe.content }}
          </div>
          <!-- 标签 -->
          <div class="title-content text-lg text-start text-[#13386c] py-5">
            {{ tagDe }}
          </div>
          <!-- 时间 -->
          <div
            class="title-content text-sm text-start text-[rgb(51,51,51,0.6)] py-5"
          >
            {{ formatTime(dataDe.createdAt, "YYYY-MM-DD HH:mm") }}
          </div>

          <div class="w-full box-border">
            <div class="bg-[rgb(0,0,0,0.1)] h-[1px] w-full"></div>
          </div>
          <!-- 标签列表 -->
          <div class="flex-1">
            <Comment
              ref="commentRef"
              v-model:comList="comList"
              v-if="isInitDone"
              :id="deId"
            />
          </div>
        </section>

        <section class="flex flex-col w-full gap-6 bg-white">
          <!-- 基本信息 -->
          <div class="flex gap-4 text-[#333]">
            <!-- 点赞 -->
            <div class="flex gap-2 items-end">
              <!-- <div
                v-if="dataDe.like"
                class="i-carbon-favorite-filled text-[#ff4d4f] text-xl"
              ></div>
              <div v-else class="i-carbon-favorite text-xl"></div> -->
              <BaseLike
                v-model:isLikePro="dataDe.like"
                @likeChange="handleLike"
              />
              <div class="text-sm">{{ likeList.length }}</div>
            </div>
            <!-- 收藏 -->
            <!-- <div class="flex gap-2 items-end">
              <div class="i-carbon-star text-xl"></div>
              <div class="text-sm">{{ 0 }}</div>
            </div> -->
            <!-- 评论 -->
            <div class="flex gap-2 items-end">
              <div class="i-carbon-chat text-xl"></div>
              <div class="text-sm">{{ comNum }}</div>
            </div>
            <div class="flex-"></div>
          </div>
          <!-- 评论 -->

          <div class="w-full flex gap-5">
            <div class="input-wrapper flex-1">
              <input
                class="comment-input"
                v-model="commentContent"
                type="textarea"
                placeholder="说点什么..."
                data-tribute="true"
              />
              <div class="input-buttons">
                <div
                  class="i-carbon-face-activated-filled text-[rgb(186, 186, 186)]"
                ></div>
              </div>
            </div>

            <button
              @click="handleSendComment"
              class="overlay__btn overlay__btn--colors"
            >
              发送
            </button>
          </div>
        </section>
      </div>
      <!-- 返回按钮 -->
      <div class="close-icon" @click="router.back()">
        <div class="i-carbon-arrow-left"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}
.conten-box {
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, 0.775);
  box-shadow: 0 0.75rem 2rem 0 rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.125);
  //   高斯模糊
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-sizing: border-box;
  overflow: hidden;

  display: flex;
  position: relative;
  .img-con {
    border-radius: 15px;
    overflow: hidden;
  }
  .de-content {
    box-sizing: border-box;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .close-icon {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 99;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    width: 40px;
    height: 40px;
    border-radius: 40px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.025), 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s;
    // color: var(--color-secondary-label);
  }
}
:deep(.el-carousel) {
  height: 100%;
  .el-carousel__container {
    height: 100%;
  }
}

// 用户信息
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
// 标题
.title-part {
  margin: 0 10px;
  .title-desc {
    text-align: left;
    font-weight: 600;
    font-size: 20px;
    line-height: 32px;
    color: #333;
  }
}
.input-wrapper {
  display: flex;
  position: relative;
  width: 100%;
  flex-shrink: 0;
  transition: flex 0.3s;

  .comment-input {
    box-sizing: border-box;
    padding: 12px 92px 12px 36px;

    background-repeat: no-repeat;
    background-size: 16px 16px;
    background-position: 16px 12px;
    width: 100%;
    height: 40px;
    line-height: 16px;
    background: #f5f5f5;
    caret-color: #5b92e1;
    border-radius: 22px;
    border: none;
    outline: none;
    // resize: none;
  }
  .input-buttons {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
    .i-carbon-send {
      font-size: 20px;
      color: #5b92e1;
      cursor: pointer;
    }
  }
}
.overlay__btn {
  width: 100px;
  margin-top: 6px;

  height: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;

  background: hsl(276, 100%, 9%);
  color: hsl(0, 0%, 100%);
  border: none;
  border-radius: 0.5rem;
  transition: transform 450ms ease;
}

.overlay__btn:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.overlay__btn-emoji {
  margin-left: 0.375rem;
}
.fraction {
  position: absolute;
  right: 28px;
  top: 24px;
  padding: 6px 14px;
  text-align: center;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  border-radius: 12px;
  z-index: 2;
  color: #fff;
  background: rgbs(64, 64, 64, 0.25);
  -webkit-backdrop-filter: saturate(150%) blur(10px);
  backdrop-filter: saturate(150%) blur(10px);
  // opacity: 0;
  transition: all 0.3s;
  // z-index: 99;
}
</style>
