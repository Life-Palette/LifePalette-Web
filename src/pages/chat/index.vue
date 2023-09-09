<!-- 生成一个聊天页面可以发送消息，可以用element-plus UI,unocss布局 -->
<template>
  <div class="flex flex-col gap-5 w-full box-border p-10">
    <!-- 绑定输入房间号 -->
    <div class="flex gap-1">
      <el-input v-model="roomId" placeholder="请输入房间号"></el-input>
      <el-button @click="joinRoom" type="primary" size="large" class="pal-btn"
        >加入房间</el-button
      >
      <el-button @click="open()" type="primary" size="large" class="pal-btn"
        >打开socket</el-button
      >
      <el-button @click="close()" type="primary" size="large" class="pal-btn"
        >关闭socket</el-button
      >
      <!-- 房间状态 -->
      <h1>房间状态:{{ status }}</h1>
    </div>

    <div class="box-border p-5">
      <DynamicScroller
        ref="chatViewRef"
        class="chat-view"
        :items="msgList"
        :min-item-size="54"
        key-fiekd="id"
        :emitUpdate="true"
      >
        <template v-slot="{ item, index, active }">
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
        v-model="sendConMsg"
        placeholder="请输入消息"
        type="textarea"
        class="flex-1"
        @keyup.enter.native="sendMsg"
      ></el-input>
      <el-button @click="sendMsg" type="primary" size="large" class="pal-btn"
        >发送</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { chatMsgFindAll } from "~/api/chat";
import { useWebSocket } from "@vueuse/core";
import { useUserStore } from "~/store/user";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import MessageCard from "~/components/Card/MessageCard.vue";
import { apiServer } from "~/utils/http/domain.js";
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
// 房间号
const roomId = ref(123);
const chatViewRef = ref(null);
const myId = computed(() => {
  return userInfo.value?.id;
});
const goBottom = () => {
  if (!chatViewRef.value) return;
  setTimeout(() => {
    chatViewRef.value.scrollToBottom();
  }, 200);
  // setTimeout(() => {
  //   isFirst.value = false;
  // }, 1000);
};
const wsOnMessage = (ws, msgCo) => {
  // console.log("🫧-----onmessage-----", ws, msgCo);
  const { data = "" } = msgCo || {};
  // console.log("🐬-----event-----", event);
  // console.log("🌈-----data-----", JSON.parse(data));
  const msgCon = JSON.parse(data);

  const { message } = msgCon || {};
  // console.log("🍪-----message-----", message);
  const { event, data: msg } = message || {};
  if (event === "message") {
    msgList.value.push(msg);
    goBottom();
  }

  //
};
const { status, data, send, open, close, ws } = useWebSocket(
  apiServer.websocket,
  {
    onMessage: wsOnMessage,
  }
);

const sendConMsg = ref("测试消息");
const msgList = ref([]);
const joinRoom = () => {
  console.log("🌈-----joinRoom-----");
  const msg = {
    event: "joinRoom",
    data: {
      userId: myId.value, // 替换为接收者ID
      roomId: roomId.value, // 替换为接收者ID
    },
  };
  const sendCon = JSON.stringify(msg);
  send(sendCon);
};
const sendMsg = () => {
  console.log("🌈-----sendMsg-----");
  const msg = {
    event: "chat",
    data: {
      userId: myId.value, // 替换为接收者ID
      roomId: roomId.value, // 替换为接收者ID
      message: sendConMsg.value, // 替换为消息内容
    },
  };
  const sendCon = JSON.stringify(msg);
  send(sendCon);
  goBottom();
};

// 🌈 数据请求
const getDataLoading = ref(false);
const getData = async () => {
  if (getDataLoading.value) return;
  getDataLoading.value = true;
  const params = {
    roomId: roomId.value,
    size: 100,
    sort: "createdAt,asc",
  };
  const { code, msg, result = [] } = ({} = await chatMsgFindAll(params));
  if (code === 200 && result) {
    console.log("---数据请求成功---", result);
    const { data = [], meta = ({} = []) } = result;
    const tempData = data.map((item) => {
      return {
        ...item,
        isTimeOut: false,
      };
    });
    console.log("🍪-----tempData-----", tempData);
    msgList.value = dataExtraction(tempData) || [];
  } else {
    console.log("---数据请求失败---", msg);
  }
  getDataLoading.value = false;
  goBottom();
};
// 数据处理
const dataExtraction = (data = []) => {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (i === 0) {
      item.isTimeOut = true;
    } else {
      const time1 = item.createdAt;
      const time2 = data[i - 1].createdAt;
      item.isTimeOut = isTimeOut(time1, time2);
    }
  }
  return data;
};
// 判断时间差值是否大于5分钟
const isTimeOut = (time1, time2) => {
  // 转为时间戳
  const time = new Date(time1).getTime() - new Date(time2).getTime();
  console.log("🌳-----time-----", time);
  const timeOut = 5 * 60 * 1000;
  return time > timeOut;
};

onMounted(async () => {
  await getData();
  joinRoom();
});
</script>

<style lang="less" scoped>
.chat-view {
  height: 400px;
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
    &:last-child {
      // padding-bottom: 10px;
    }
  }
}
</style>
