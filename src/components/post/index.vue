<script setup>
import { ElMessage } from 'element-plus'
import { to } from '@iceywu/utils'
import { fileUpdate } from '~/api/ossUpload'
// import { uploadFile } from "~/api/common";
import { topicCreate, topicEdit } from '~/api/topic'
import { tagFindAll } from '~/api/tag'
// import { uploadFile } from '~/utils/upload'
import { uploadFile } from '~/utils/uploadAli'

const props = defineProps({
  isShowDialog: {
    type: Boolean,
    default: true,
  },
  data: {
    type: Object,
    default: () => {},
  },
})

const emit = defineEmits(['update:isShowDialog'])

// 图片上传
async function beforeUploadFunc(file, data, index) {
  upPercent.value = 0
  showUploadLoading.value = true
  const result = await uploadFile(file, (res) => {
    const { percent, stage = 'upload' } = res
    upText.value = stage === 'upload' ? '上传中...' : '生成blushHash...'
  })
  const { url = '' } = result || {}
  const updateParams = {
    id: data.id,
    videoSrc: url,
  }
  const [fileUpdateErr, fileUpdateData] = ({} = await to(
    fileUpdate(updateParams),
  ))
  if (fileUpdateData) {
    const { code, msg, result } = fileUpdateData || {}
    if (code === 200) {
      const { videoSrc } = result
      fileList.value[index].videoSrc = videoSrc
    }
  }

  showUploadLoading.value = false
}

const { files, open, reset, onChange } = useFileDialog({
  accept: 'image/*,video/*',
})
const dialogVisible = ref(true)

function closeDialog() {
  emit('update:isShowDialog', false)
}

const fileList = ref([])
const formData = reactive({
  content: '',
  title: '',
  files: [],
  tagIds: [],
})

const upPercent = ref(0)
const upText = ref('上传中...')
const showUploadLoading = ref(false)

function deleteItem(index) {
  fileList.value.splice(index, 1)
}

onChange(async (file) => {
  // loading
  upPercent.value = 0
  showUploadLoading.value = true
  for (let i = 0; i < file.length; i++) {
    // const data = new FormData()
    // data.append('file', file[i])
    const result = await uploadFile(file[i], (res) => {
      // console.log('🌈-----res-----', res)
      const { percent, stage = 'upload' } = res
      const nowPart = (i + 1) / file.length
      upPercent.value = percent * nowPart
      upText.value = stage === 'upload' ? '上传中...' : '生成blushHash...'
    })
    console.log('文件上传成功', result)
    const { type, url, id, videoSrc } = result
    // type:"image/jpeg"
    // 获取/前面的字符串并转为大写
    const fileType = type.split('/')[0].toUpperCase()
    const fileData = {
      id,
      fileType,
      file: url,
      thumbnail: `${url}?x-oss-process=image/resize,l_500`,
      videoSrc,
    }
    fileList.value.push(fileData)
  }
  showUploadLoading.value = false
})

// 创建话题
const saveLoading = ref(false)
async function handleSave() {
  // console.log('formData', formData)
  const { id } = props.data || {}
  if (id) {
    handleEdit()
    return
  }
  if (saveLoading.value) {
    return
  }
  if (!formData.content) {
    ElMessage.error('请输入内容')
    return
  }
  if (!formData.title) {
    ElMessage.error('请输入标题')
    return
  }
  if (fileList.value.length === 0) {
    ElMessage.error('请上传图片')
    return
  }
  saveLoading.value = true
  // const files = fileList.value || []
  const files = fileList.value.map((item) => {
    const { fileType, file, thumbnail, videoSrc } = item
    return {
      fileType,
      file,
      thumbnail,
      videoSrc,
    }
  })

  const params = {
    content: formData.content,
    title: formData.title,
    files,
  }
  if (chooseTagIds.value.length > 0) {
    params.tagIds = chooseTagIds.value
  }
  // console.log('params', params)
  // return

  const { code, msg, result } = await topicCreate(params)
  if (code === 200) {
    console.log('创建话题成功', result)
    ElMessage.success('创建话题成功')
    closeDialog()
    window.location.reload()
  }
  else {
    console.log('创建话题失败', msg)
    ElMessage.error('创建话题失败')
  }
  saveLoading.value = false
}
async function handleEdit() {
  if (saveLoading.value)
    return
  saveLoading.value = true
  const { id } = props.data
  const gps_data = addDataForm.value
  const extraData = JSON.stringify({ gps_data })
  const params = {
    id,
    extraData,
  }

  // console.log('params', params)
  // return

  const { code, msg, result } = await topicEdit(params)

  if (code === 200) {
    ElMessage.success('编辑话题成功')
    closeDialog()
  }
  else {
    ElMessage.error('编辑话题失败')
  }
  saveLoading.value = false
}
// 内容校验
function validateContent(rule, value, callback) {
  if (!value) {
    return callback(new Error('请输入内容'))
  }
  callback()
}
// 获取标签列表
const tagList = ref([])
// 选中的标签
const chooseTagIds = ref([])
async function getTestData() {
  const params = {
    sort: 'asc,createdAt',
  }
  const { code, msg, result } = ({} = await tagFindAll(params))

  if (code === 200) {
    console.log('获取标签列表成功', result)
    const { data = [] } = result
    tagList.value = data
    console.log('tagList.value', tagList.value)
  }
  else {
    console.log('获取标签列表失败', msg)
  }
}
function handleTagClick(item) {
  // console.log("item", item);
  const { id } = item
  if (chooseTagIds.value.includes(id)) {
    chooseTagIds.value = chooseTagIds.value.filter(item => item !== id)
  }
  else {
    chooseTagIds.value.push(id)
  }
}
// 数据初始化
async function initData() {
  tagList.value = []
  await getTestData()
  initExtraData()
}
onMounted(() => {
  initData()
})
const addDataForm = ref({
  lng: '',
  lat: '',
})
function initExtraData() {
  const { extraData } = props.data || {}
  if (extraData) {
    const { gps_data } = JSON.parse(extraData)
    addDataForm.value.lng = gps_data.lng
    addDataForm.value.lat = gps_data.lat
  }
}
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
    <div class="form-box">
      <div>发表</div>
      <template v-if="data?.id">
        <!-- 经度 -->
        <section class="post-item">
          <div class="post-title">
            经度
          </div>
          <div class="post-title-box">
            <input
              v-model="addDataForm.lng"
              type="text"
              class="input-title"
              maxlength="30"
              placeholder="请输入经度"
            >
          </div>
        </section>
        <!-- 纬度 -->
        <section class="post-item">
          <div class="post-title">
            纬度
          </div>
          <div class="post-title-box">
            <input
              v-model="addDataForm.lat"
              type="text"
              class="input-title"
              maxlength="30"
              placeholder="请输入纬度"
            >
          </div>
        </section>
      </template>
      <template v-else>
        <!-- 图片 -->
        <section class="post-item">
          <div class="post-title">
            图片
          </div>
          <div class="post-content">
            <div
              v-for="(item, index) in fileList"
              :key="index"
              class="img-item"
            >
              <div class="upload-item relative">
                <!-- 删除按钮 -->
                <div
                  class="i-carbon-delete absolute right-2 top-2 z-99 cursor-pointer"
                  @click="deleteItem(index)"
                />
                <!-- live-tag -->
                <div class="absolute bottom-2 right-2 z-99 cursor-pointer">
                  <el-tag v-if="item.videoSrc" round type="primary">
                    live
                  </el-tag>
                </div>
                <!-- 图片 -->
                <template v-if="item.fileType == 'IMAGE'">
                  <el-image class="h-full w-full" fit="cover" :src="item.file">
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
                    class="h-full w-full"
                    controls
                    :src="item.file"
                    type="video/mp4"
                    :poster="item.cover"
                  />
                </template>
                <!-- live photo -->
                <el-upload
                  ref="uploadRef"
                  class="absolute left-2 top-2 z-99 cursor-pointer"
                  action="#"
                  :show-file-list="false"
                  accept="video/*"
                  :http-request="() => {}"
                  :before-upload="(file) => beforeUploadFunc(file, item, index)"
                >
                  <template #trigger>
                    <el-button round type="primary">
                      <div class="i-carbon-deletecursor-pointer">
                        +
                      </div>
                    </el-button>
                  </template>
                </el-upload>
              </div>
            </div>

            <div class="add-icon">
              <button type="button" @click="open">
                <div class="i-carbon-add text-5xl text-[#4c4d4f]" />
              </button>
            </div>
          </div>
        </section>
        <!-- 标题 -->
        <section class="post-item">
          <div class="post-title">
            标题
          </div>
          <div class="post-title-box">
            <input
              v-model="formData.title"
              type="text"
              class="input-title"
              maxlength="30"
              placeholder="请输入标题"
            >
          </div>
        </section>
        <!-- 内容 -->
        <section class="post-item">
          <div class="post-title">
            内容
          </div>
          <div class="post-conten-box">
            <textarea
              v-model="formData.content"
              type="textarea"
              class="input-textarea"
              placeholder="请输入内容"
            />
          </div>
        </section>
        <!-- 标签 -->
        <section class="post-item">
          <div class="post-title">
            标签
          </div>
          <div class="post-tag-box">
            <div
              v-for="(item, index) in tagList"
              :key="index"
              class="tag-item"
              :class="{ 'tag-item-active': chooseTagIds.includes(item.id) }"
              @click="handleTagClick(item)"
            >
              {{ item.title }}
            </div>
          </div>
        </section>
      </template>

      <!-- 按钮 -->
      <section class="post-btn">
        <button class="overlay__btn overlay__btn--colors" @click="handleSave">
          <span>
            {{ data?.id ? '编辑' : '发布' }}
          </span>
          <span class="overlay__btn-emoji">💕</span>
        </button>
      </section>
    </div>
  </el-dialog>
  <LoadingUpload
    v-model:percent="upPercent"
    v-model:text="upText"
    v-model:isShow="showUploadLoading"
  />
</template>

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
    box-shadow:
      12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
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
    box-shadow:
      12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
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
.no-dlg-bg-class {
  background: none !important;
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
