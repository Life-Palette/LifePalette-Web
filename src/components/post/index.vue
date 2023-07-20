<template>
  <el-dialog
    append-to-body
    v-model="dialogVisible"
    title="Tips"
    width="600px"
    top="8vh"
    @close="closeDialog"
  >
    <div class="form-box">
      <div>发表</div>
      <!-- 图片 -->
      <section class="post-item">
        <div class="post-title">图片</div>
        <div class="post-content">
          <div class="img-item" v-for="(item, index) in fileList" :key="index">
            <div class="upload-item">
              <!-- 图片 -->
              <template v-if="item.fileType == 'IMAGE'">
                <el-image class="w-full h-full" fit="cover" :src="item.file">
                  <template #placeholder>
                    <div class="image-slot">
                      Loading<span class="dot">...</span>
                    </div>
                  </template>
                </el-image>
              </template>
              <!-- 视频 -->
              <template v-else-if="item.fileType == 'VIDEO'">
                <video
                  class="w-full h-full"
                  controls
                  :src="item.file"
                  type="video/mp4"
                  :poster="item.cover"
                ></video>
              </template>
            </div>
          </div>
          <div class="add-icon">
            <button type="button" @click="open">
              <div class="i-carbon-add text-5xl text-[#4c4d4f]"></div>
            </button>
          </div>
        </div>
      </section>
      <!-- 标题 -->
      <section class="post-item">
        <div class="post-title">标题</div>
        <div class="post-title-box">
          <input
            type="text"
            class="input-title"
            v-model="formData.title"
            maxlength="30"
            placeholder="请输入标题"
          />
        </div>
      </section>
      <!-- 内容 -->
      <section class="post-item">
        <div class="post-title">内容</div>
        <div class="post-conten-box">
          <textarea
            type="textarea"
            class="input-textarea"
            v-model="formData.content"
            placeholder="请输入内容"
          />
        </div>
      </section>
      <!-- 标签 -->
      <section class="post-item">
        <div class="post-title">标签</div>
        <div class="post-tag-box">
          <div
            class="tag-item"
            :class="{ 'tag-item-active': chooseTagIds.includes(item.id) }"
            v-for="(item, index) in tagList"
            :key="index"
            @click="handleTagClick(item)"
          >
            {{ item.title }}
          </div>
        </div>
      </section>
      <!-- 按钮 -->
      <section class="post-btn">
        <button @click="handleSave" class="overlay__btn overlay__btn--colors">
          <span>发布</span>
          <span class="overlay__btn-emoji">💕</span>
        </button>
      </section>
    </div>
  </el-dialog>
  <LoadingUpload
    v-model:percent="upPercent"
    v-model:isShow="showUploadLoading"
  />
</template>

<script setup>
import { getUploadId, uploadPart } from "~/api/ossUpload";
// import { uploadFile } from "~/api/common";
import { topicCreate } from "~/api/topic";
import { tagFindAll } from "~/api/tag";
import { uploadFile } from "~/utils/upload";
import { ElMessage, ElLoading } from "element-plus";

const { files, open, reset, onChange } = useFileDialog({
  accept: "image/*,video/*",
});
const props = defineProps({
  isShowDialog: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:isShowDialog"]);

const dialogVisible = ref(true);

const closeDialog = () => {
  emit("update:isShowDialog", false);
};

const fileList = ref([]);
const formData = reactive({
  content: "",
  title: "",
  files: [],
  tagIds: [],
});

const upPercent = ref(0);
const showUploadLoading = ref(false);

onChange(async (file) => {
  // loading
  upPercent.value = 0;
  showUploadLoading.value = true;
  for (let i = 0; i < file.length; i++) {
    const { code, msg, result } = await uploadFile(file[i], (progress) => {
      console.log("上传进度", progress);
      const { percent } = progress;
      upPercent.value = percent;
    });
    if (code === 200) {
      console.log("文件上传成功", result);
      fileList.value.push(result);
    } else {
      ElMessage.error(msg);
    }
  }
  showUploadLoading.value = false;
});

// 创建话题
const saveLoading = ref(false);
const handleSave = async () => {
  console.log("formData", formData);
  if (saveLoading.value) {
    return;
  }
  if (!formData.content) {
    ElMessage.error("请输入内容");
    return;
  }
  if (!formData.title) {
    ElMessage.error("请输入标题");
    return;
  }
  if (fileList.value.length === 0) {
    ElMessage.error("请上传图片");
    return;
  }
  saveLoading.value = true;
  const files = fileList.value || [];
  // const files = fileList.value.map((item) => {
  //   return {
  //     filePath: item.filePath,
  //     thumbnailPath: item.thumbnailPath,
  //   };
  // });

  const params = {
    content: formData.content,
    title: formData.title,
    files,
  };
  if (chooseTagIds.value.length > 0) {
    params.tagIds = chooseTagIds.value;
  }
  console.log("params", params);
  // return;

  const { code, msg, result } = await topicCreate(params);
  if (code === 200) {
    console.log("创建话题成功", result);
    ElMessage.success("创建话题成功");
    closeDialog();
    window.location.reload();
  } else {
    console.log("创建话题失败", msg);
    ElMessage.error("创建话题失败");
  }
  saveLoading.value = false;
};
// 内容校验
const validateContent = (rule, value, callback) => {
  if (!value) {
    return callback(new Error("请输入内容"));
  }
  callback();
};
// 获取标签列表
const tagList = ref([]);
// 选中的标签
const chooseTagIds = ref([]);
const getTestData = async () => {
  const params = {
    sort: "asc,createdAt",
  };
  const { code, msg, result } = ({} = await tagFindAll(params));

  if (code === 200) {
    console.log("获取标签列表成功", result);
    const { data = [] } = result;
    tagList.value = data;
    console.log("tagList.value", tagList.value);
  } else {
    console.log("获取标签列表失败", msg);
  }
};
const handleTagClick = (item) => {
  // console.log("item", item);
  const { id } = item;
  if (chooseTagIds.value.includes(id)) {
    chooseTagIds.value = chooseTagIds.value.filter((item) => item !== id);
  } else {
    chooseTagIds.value.push(id);
  }
};
// 数据初始化
const initData = async () => {
  tagList.value = [];
  await getTestData();
};
onMounted(() => {
  initData();
});
</script>

<style lang="less" scoped>
.form-box {
  // height: 450px;
  display: flex;
  flex-direction: column;
  // align-items: center;
  box-sizing: border-box;
  gap: 15px;
  width: 100%;
  padding: 30px 30px;
  background: rgba(255, 255, 255, 0.775);
  box-shadow: 0 0.75rem 2rem 0 rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.125);
  //   高斯模糊
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  .post-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .post-title {
      font-size: 20px;
      font-weight: 900;
    }
  }
  .post-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .overlay__btn {
      margin-top: 6px;
      width: 100%;
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
  }
}
// 文件
.post-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  .img-item {
    width: 150px;
    height: 200px;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    .upload-item {
      width: 100%;
      height: 100%;
      .el-image {
        width: 100%;
        height: 100%;
      }
    }
  }
  .add-icon {
    width: 150px;
    height: 200px;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px dashed #4c4d4f;
    button {
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        // background: #f5f5f5;
        // backdrop-filter: blur(1px);
      }
    }
  }
}
// 标题
.post-title-box {
  .input-title {
    box-sizing: border-box;
    border: 1px solid transparent;
    cursor: pointer;

    outline: none;
    width: 100%;
    padding: 16px 10px;
    background-color: rgba(247, 243, 243, 0.5);
    border-radius: 10px;
    box-shadow: 12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
      100px 100px 80px rgba(0, 0, 0, 0.03);
    &:focus {
      border: 1px solid rgb(23, 111, 211);
    }
  }
}
// 内容
.post-conten-box {
  .input-textarea {
    box-sizing: border-box;
    border: 1px solid transparent;
    cursor: pointer;
    outline: none;
    width: 100% !important;
    min-height: 100px;
    padding: 16px 10px;
    background-color: rgba(247, 243, 243, 0.5);
    border-radius: 10px;
    box-shadow: 12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
      100px 100px 80px rgba(0, 0, 0, 0.03);
    &:focus {
      border: 1px solid rgb(23, 111, 211);
    }
  }
}
// 标签
.post-tag-box {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  .tag-item {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
    height: 30px;
    border-radius: 15px;
    background: #f5f5f5;
    cursor: pointer;
    &:hover {
      background: #e5e5e5;
    }
    &-active {
      background: #4c4d4f;
      color: #fff;
      &:hover {
        background: #4c4d4f;
      }
    }
  }
}
</style>

<style lang="less">
.el-dialog {
  background: none !important;
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
