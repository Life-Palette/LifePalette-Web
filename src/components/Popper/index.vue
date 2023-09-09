<script setup>
import { ref } from "vue";
import { noticesData } from "./data";
import NoticeList from "./noticeList.vue";
import { messageFindAll, messageUnreadCount } from "~/api/message";
import { formatTimeBefore } from "~/utils";

const noticesNum = ref(0);
const notices = ref(noticesData);
const activeKey = ref(noticesData[0].key);

// notices.value.map((v) => (noticesNum.value += v.list.length));

const page = ref(1);
const pageSize = ref(10);
// 🌈 数据请求
const getDataLoading = ref(false);
const getMessageUnreadCount = async () => {
  const params = {
    
  };
  const { code, msg, result = [] } = ({} = await messageUnreadCount(params));
  if (code === 200 && result) {
    const { count = 0 } = result;
    noticesNum.value = count;
  } else {
  }
};
const getData = async () => {
  if (getDataLoading.value) return;
  getDataLoading.value = true;
  const params = {
    page,
    size: pageSize.value,
    sort: "createdAt,desc",
  };
  const { code, msg, result = [] } = ({} = await messageFindAll(params));
  if (code === 200 && result) {
    const { data = [], meta = {} } = result;
    const dataTemp = data.map((item) => {
      const { sendUserInfo, content, createdAt, objInfo, type } = item;
      const cover =
        objInfo?.files.length > 0 ? objInfo?.files[0].thumbnail : "";
      return {
        ...item,
        avatar: "",
        cover,
        title: `${sendUserInfo.name}${content}`,
        datetime: formatTimeBefore(createdAt),
        description: "",
        // type: "1",
      };
    });
    notices.value[0].list = dataTemp || [];
    // dataTemp
  } else {
  }
  getDataLoading.value = false;
};
onMounted(() => {
  getMessageUnreadCount();
  getData();
});
</script>

<template>
  <el-dropdown trigger="click" placement="bottom-end">
    <span class="dropdown-badge navbar-bg-hover select-none">
      <el-badge :value="noticesNum" :hidden="noticesNum === 0" :max="99">
        <div icon-btn i-carbon-notification-new mt-1.5 />
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs
          :stretch="true"
          v-model="activeKey"
          class="dropdown-tabs"
          :style="{ width: notices.length === 0 ? '200px' : '330px' }"
        >
          <el-empty
            v-if="notices.length === 0"
            description="暂无消息"
            :image-size="60"
          />
          <span v-else>
            <template v-for="item in notices" :key="item.key">
              <el-tab-pane
                :label="`${item.name}(${item.list.length})`"
                :name="`${item.key}`"
              >
                <el-scrollbar max-height="330px">
                  <div class="noticeList-container">
                    <NoticeList :list="item.list" />
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </template>
          </span>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="less" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  margin-right: 10px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
