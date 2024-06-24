<script setup>
import { ref } from 'vue'
import { noticesData } from './data'
import NoticeList from './noticeList.vue'
import { messageFindAll, messageUnreadCount } from '~/api/message'
import { formatTimeBefore } from '~/utils'

const noticesNum = ref(0)
const notices = ref(noticesData)
const activeKey = ref(noticesData[0].key)

// notices.value.map((v) => (noticesNum.value += v.list.length));

const page = ref(1)
const pageSize = ref(10)
// 🌈 数据请求
const getDataLoading = ref(false)
async function getMessageUnreadCount() {
  const params = {}
  const { code, msg, result = [] } = ({} = await messageUnreadCount(params))
  if (code === 200 && result) {
    const { count = 0 } = result
    noticesNum.value = count
  }
}
async function getData(type) {
  console.log('🐠-----type-----', type)
  if (getDataLoading.value)
    return
  getDataLoading.value = true
  const params = {
    page: page.value,
    size: pageSize.value,
    sort: 'createdAt,desc',
    type,
  }
  const { code, msg, result = [] } = ({} = await messageFindAll(params))
  if (code === 200 && result) {
    const { data = [], meta = {} } = result
    handleNotice(data)
  }
  getDataLoading.value = false
}

// 消息处理
function handleNotice(data) {
  let dataTemp
  const type = data[0]?.type
  switch (type) {
    case 'like':
      dataTemp = data.map((item) => {
        const { sendUserInfo, content, createdAt, objInfo, type } = item
        const cover
					= objInfo?.files.length > 0 ? objInfo?.files[0].thumbnail : ''
        return {
          ...item,
          avatar:
						'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
          cover,
          title: `${sendUserInfo?.name}${content}`,
          datetime: formatTimeBefore(createdAt),
          description: '',
          // type: "1",
        }
      })
      notices.value[0].list = dataTemp || []
      break
    case 'system':
      dataTemp = data.map((item) => {
        const { sendUserInfo, content, createdAt, objInfo, type } = item
        const cover
					= objInfo?.files.length > 0 ? objInfo?.files[0].thumbnail : ''
        return {
          ...item,
          avatar:
						'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
          cover,
          title: `系统通知`,
          datetime: formatTimeBefore(createdAt),
          description: content,
          // type: "1",
        }
      })
      notices.value[1].list = dataTemp || []
      break
    default:
      break
  }
}

onMounted(async () => {
  getMessageUnreadCount()
  await getData()
  await getData('system')
})
</script>

<template>
  <el-dropdown trigger="click" placement="bottom-end">
    <span class="dropdown-badge navbar-bg-hover select-none">
      <el-badge :value="noticesNum" :hidden="noticesNum === 0" :max="99">
        <div i-carbon-notification-new mt-1.5 icon-btn />
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs
          v-model="activeKey"
          :stretch="true"
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
