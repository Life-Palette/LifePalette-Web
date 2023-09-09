<script setup>
import { messageUpdate } from "~/api/message";
import { useRouter, useRoute } from "vue-router";
// import { ListItem } from "./data";
import NoticeItem from "./noticeItem.vue";
const router = useRouter();
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});
const handleItemClick = (data) => {
  
  const { type, objInfo = {} } = data || {};
  switch (type) {
    case "like":
      const { id, files } = objInfo;
      // 消息状态更新
      handlemessageUpdate(data.id);
      const imgCover = files[0].file;
      router.push(`/detail/${id}?imgCover=${imgCover}`);
      break;
    default:
      break;
  }
};
// 消息状态更新
const handlemessageUpdate = async (id) => {
  const params = {
    id,
  };
  const { code, msg, result } = ({} = await messageUpdate(params));
  if (code === 200) {
    
  } else {
    
  }
};
</script>

<template>
  <div v-if="props.list.length">
    <NoticeItem
      v-for="(item, index) in props.list"
      :noticeItem="item"
      :key="index"
      @click.stop="handleItemClick(item)"
    />
  </div>
  <el-empty v-else description="暂无数据" />
</template>
