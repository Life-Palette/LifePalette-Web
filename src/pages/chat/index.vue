<!-- 生成一个聊天页面可以发送消息，使用shadcn-vue UI组件,unocss布局 -->
<script setup>
import { useWebSocket } from '@vueuse/core'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { Button } from '@/components/ui/button'
import { chatMsgFindAll } from '~/api/chat'
import MessageCard from '~/components/Card/MessageCard.vue'
import { useUserStore } from '~/stores/user'
import { baseUrl } from '~/utils/http/base'
import { uploadFile } from '~/utils/uploadAli'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const upPercent = ref(0)
const showUploadLoading = ref(false)
const {
  files,
  open: fileOpen,
  reset,
  onChange,
} = useFileDialog({
  accept: 'image/*,video/*',
})
onChange(async (file) => {
  // loading
  upPercent.value = 0
  showUploadLoading.value = true
  for (let i = 0; i < file.length; i++) {
    const result = await uploadFile(file[i], (progress) => {
      console.log('上传进度', progress)
      const { percent } = progress
      upPercent.value = percent
    })
    const msg = {
      event: 'chat',
      data: {
        userId: myId.value, // 替换为接收者ID
        roomId: roomId.value, // 替换为接收者ID
        file: result,
        type: 'file',
      },
    }
    const sendCon = JSON.stringify(msg)
    send(sendCon)
    goBottom()
  }
  showUploadLoading.value = false
})

// 房间号
const roomId = ref(123)
const chatViewRef = ref(null)

const myId = computed(() => {
  return userInfo.value?.id
})
function goBottom() {
  if (!chatViewRef.value)
    return
  setTimeout(() => {
    sendConMsg.value = ''
    chatViewRef.value.scrollToBottom()
  }, 200)
  // setTimeout(() => {
  //   isFirst.value = false;
  // }, 1000);
}
//
const totalNums = ref(0)
function wsOnMessage(ws, msgCo) {
  // console.log("🫧-----onmessage-----", ws, msgCo);
  const { data = '' } = msgCo || {}
  // console.log("🐬-----event-----", event);
  // console.log("🌈-----data-----", JSON.parse(data));
  const msgCon = JSON.parse(data)
  // console.log("🌈-----msgCon-----", msgCon);

  const { message, totalNum } = msgCon || {}
  totalNums.value = totalNum || 0
  // console.log("🍪-----message-----", message);
  const { event, data: msg } = message || {}
  if (event === 'message') {
    msgList.value.push(msg)
    dataExtraction()
    goBottom()
  }

  //
}
const { status, data, send, open, close, ws } = useWebSocket(
  baseUrl.websocket,
  {
    onMessage: wsOnMessage,
  },
)

const sendConMsg = ref('')
const msgList = ref([])
function joinRoom() {
  console.log('🌈-----joinRoom-----')
  const msg = {
    event: 'joinRoom',
    data: {
      userId: myId.value, // 替换为接收者ID
      roomId: roomId.value, // 替换为接收者ID
    },
  }
  const sendCon = JSON.stringify(msg)
  send(sendCon)
}
function sendMsg() {
  console.log('🌈-----sendMsg-----')
  const msg = {
    event: 'chat',
    data: {
      userId: myId.value, // 替换为接收者ID
      roomId: roomId.value, // 替换为接收者ID
      message: sendConMsg.value, // 替换为消息内容
    },
  }
  const sendCon = JSON.stringify(msg)
  send(sendCon)
  goBottom()
}

// 🌈 数据请求
const getDataLoading = ref(false)
async function getData() {
  if (getDataLoading.value)
    return
  getDataLoading.value = true
  const params = {
    roomId: roomId.value,
    size: 100,
    sort: 'createdAt,asc',
  }
  const { code, msg, result = [] } = ({} = await chatMsgFindAll(params))
  if (code === 200 && result) {
    console.log('---数据请求成功---', result)
    const { data = [], meta = ({} = []) } = result
    const tempData = data.map((item) => {
      return {
        ...item,
        isTimeOut: false,
      }
    })

    msgList.value = tempData || []
    dataExtraction()
  }
  else {
    console.log('---数据请求失败---', msg)
  }
  getDataLoading.value = false
  goBottom()
}
// 数据处理
function dataExtraction() {
  const tData = JSON.parse(JSON.stringify(msgList.value))
  for (let i = 0; i < tData.length; i++) {
    const item = tData[i]
    if (i === 0) {
      item.isTimeOut = true
    }
    else {
      const time1 = item.createdAt
      const time2 = tData[i - 1].createdAt
      item.isTimeOut = isTimeOut(time1, time2)
    }
  }
  msgList.value = tData
}
// 判断时间差值是否大于5分钟
function isTimeOut(time1, time2) {
  // 转为时间戳
  const time = new Date(time1).getTime() - new Date(time2).getTime()
  // console.log("🌳-----time-----", time);
  const timeOut = 5 * 60 * 1000
  return time > timeOut
}

onMounted(async () => {
  await getData()
  joinRoom()
})
</script>

<template>
  <div class="p-10 flex flex-col gap-5 w-full box-border">
    <!-- 绑定输入房间号 -->
    <div class="flex flex-col gap-5">
      <div flex>
        <el-input
          v-model="roomId"
          size="large"
          placeholder="请输入房间号"
        />
      </div>

      <div flex gap-5 items-center>
        <!-- 房间状态 -->
        <h1 class="whitespace-nowrap">
          房间状态:{{ status }}
        </h1>
        <h1 class="whitespace-nowrap">
          在线人数:{{ totalNums }}
        </h1>
        <Button size="lg" class="pal-btn" @click="joinRoom">
          加入房间
        </Button>
        <Button size="lg" class="pal-btn" @click="open()">
          打开socket
        </Button>
        <Button size="lg" class="pal-btn" @click="close()">
          关闭socket
        </Button>
      </div>
    </div>

    <div class="p-5 box-border">
      <DynamicScroller
        ref="chatViewRef"
        class="chat-view"
        :items="msgList"
        :min-item-size="54"
        key-fiekd="id"
        :emit-update="true"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[item.content]"
            :data-index="index"
          >
            <div class="chat-item">
              <MessageCard :data="item" />
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>

    <div class="flex gap-1">
      <el-input
        v-model.trim="sendConMsg"
        placeholder="请输入消息"
        type="textarea"
        class="flex-1"
        @keyup.enter="sendMsg"
      />
      <Button size="lg" class="pal-btn" @click="sendMsg">
        发送
      </Button>
      <Button size="lg" class="pal-btn" @click="fileOpen">
        文件
      </Button>
    </div>
    <LoadingUpload
      v-model:percent="upPercent"
      v-model:is-show="showUploadLoading"
    />
  </div>
</template>

<style lang="less" scoped>
.chat-view {
  // height: 400px;
  height: calc(100vh - 400px);
  // height: 100%;
  // background: red;
  width: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 10px 10px;
  background: #f5f5f5;
  border-radius: 10px;
  .chat-item {
    min-height: 80px;
    // background: blue;
    box-sizing: border-box;
    padding-bottom: 20px;
    /* &:last-child empty rule removed */
  }
}
</style>
