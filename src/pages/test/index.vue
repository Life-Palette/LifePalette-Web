<script setup>
import { useWebSocket } from '@vueuse/core'

const msgList = ref([])
const userId = ref(1)
const roomId = ref(123)

function wsOnMessage(ws, event) {
  console.log('🫧-----onmessage-----', ws, event)
  const { data = '' } = event || {}
  console.log('🫧-----data-----', data)
  msgList.value.push(JSON.parse(data))
  console.log('🐬-----msgList.value-----', msgList.value)
}
function wsOnConnected(ws, event) {
  console.log('🌳-----nConnected-----', ws, event)
}
function wsOnDisconnected(ws, event) {
  console.log('🌳-----OnDisconnected-----', ws, event)
}
function wsOnError(ws, event) {
  console.log('🎇-----OnError-----', ws, event)
}
function sendMsg() {
  console.log('🌈-----sendMsg ----- ')
  const msg = {
    event: 'hello2',
    data: 12121,
  }
  const sendCon = JSON.stringify(msg)
  send(sendCon)
}
const { status, data, send, open, close, ws } = useWebSocket(
  'ws://localhost:3003',
  {
    onMessage: wsOnMessage,
    // onConnected: wsOnConnected,
    // onDisconnected: wsOnDisconnected,
    onError: wsOnError,
  },
)
function joinRoom() {
  console.log('🌈-----joinRoom-----')
  const msg = {
    event: 'joinRoom',
    data: {
      userId: userId.value, // 替换为接收者ID
      roomId: roomId.value, // 替换为接收者ID
    },
  }
  const sendCon = JSON.stringify(msg)
  send(sendCon)
}
function sendMsg2() {
  console.log('🌈-----sendMsg2-----')
  const msg = {
    event: 'chat',
    data: {
      userId: userId.value, // 替换为接收者ID
      roomId: roomId.value, // 替换为接收者ID
      message: 'Hello! How are you?', // 替换为消息内容
      // senderName: "Alice", // 替换为发送者名称
      // receiverId: "456", // 替换为接收者ID
      // content: "Hello! How are you?", // 替换为消息内容
    },
  }
  const sendCon = JSON.stringify(msg)
  send(sendCon)
}
// 离开房间
function leaveRoom() {
  const msg = {
    event: 'leaveRoom',
    data: {
      userId: userId.value, // 替换为接收者ID
      roomId: roomId.value, // 替换为接收者ID
    },
  }
  const sendCon = JSON.stringify(msg)
  send(sendCon)
}
onMounted(() => {
  // console.log("🌳-----ws-----", ws.value);
})
</script>

<template>
  <div>
    <h1>test</h1>

    <button class="pal-btn" @click="toggleDark()">
      模式切换
    </button>
    <h1>status:{{ status }}</h1>
    <h1>data:{{ data }}</h1>
    <button class="pal-btn" @click="sendMsg">
      发送
    </button>
    <button class="pal-btn" @click="open()">
      打开
    </button>
    <button class="pal-btn" @click="close()">
      关闭
    </button>
    <button class="pal-btn" @click="msgList = []">
      清空数据
    </button>
    <div class="flex flex-col gap-1">
      <div v-for="item in msgList" :key="item">
        {{ item.data }}
      </div>
    </div>

    <div mt-10>
      <el-button size="large" type="primary" @click="joinRoom">
        加入房间
      </el-button>
      <el-button size="large" type="primary" @click="sendMsg2">
        发送消息
      </el-button>
      <el-button size="large" type="primary" @click="leaveRoom">
        离开房间
      </el-button>
    </div>
  </div>
</template>

<style lang="less" scoped></style>
