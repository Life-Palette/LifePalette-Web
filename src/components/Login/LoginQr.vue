<script setup>
import axios from 'axios'
import QRCode from 'qrcode'
import { ElMessage } from 'element-plus'
import { qrChangeSate, qrCheck, qrGenerate, qrLogin, qrRefresh } from '~/api/qr'
import { useUserStore } from '~/stores/user'
import { setToken } from '~/utils/auth'

const emit = defineEmits(['closeDialog'])
const userStore = useUserStore()

const qrCodeData = reactive({
  loginQRCodeStatus: 'notGet', // 二维码登录状态 | normal 正常 | timeout 超时 | success 登录成功
  qrToken: '',
  loginQrCode: '', // 二维码图片
  loginQrCodeTimer: 0, // 有效时间
  checkLoginTimer: 0, // 轮询时间
})
// 二维码状态枚举（待扫码，待确定，授权成功，过期）
const QRCodeStatus = {
  // 待扫码
  pending: {
    code: 801,
    text: '待扫码',
  },
  // 待确定
  confirm: {
    code: 802,
    text: '待确定',
  },
  // 授权成功
  success: {
    code: 803,
    text: '授权成功',
  },
  // 过期
  timeout: {
    code: 800,
    text: '过期',
  },
}

const qrKey = ref('')
const qrImg = ref('')
const qrCodeStatus = ref('pending')

onMounted(() => {
  getLoginQrCode()
}) // 初始二维码
// 页面销毁
onUnmounted(() => {
  // console.log("页面销毁");
  clearQrTimer()
})

async function getLoginQrCode() {
  const { code, result, msg } = await qrGenerate()
  if (code === 200 && result) {
    console.log('二维码生成成功', result)
    const { key } = result
    qrKey.value = key
  }
  else {
    console.log('二维码生成失败', msg)
  }

  qrCodeData.qrToken = ''
  QRCode.toDataURL(
    JSON.stringify({
      ...result,
      copyright: 'app',
      function: 'pc_login',
    }),
    {
      margin: 1.8, // 二维码留白边距
      // color: {
      //   // dark: "#010599FF",
      //   // light: "#FFBF60FF",
      //   // 透明背景

      // },
    },
  )
    .then((url) => {
      qrImg.value = url // 生成的二维码
    })
    .catch((err) => {
      console.error(err)
    })
  qrCodeData.loginQRCodeStatus = 'normal' // 将状态设置为正常
  // 轮询检测扫码状态
  getQrCodeState()
}
function checkAppLogin() {
  if (qrCodeData.loginQRCodeStatus === 'normal') {
    // 开启检测
    qrCodeData.checkLoginTimer = setTimeout(async () => {
      // 轮询
      // 发起扫app二维码登录的接口
      const res = axios.post({})

      if (res.code === 211) {
        // 二维码已过期，请刷新
        qrCodeData.loginQRCodeStatus = 'timeout'
        return
      }
      if (res.code === 210) {
        // 继续检查是否被使用
        checkAppLogin()
        return
      }
      if (res.code === 200) {
        // 登录成功
        afterLogin(res)
        return
      }

      clearInterval(qrCodeData.checkLoginTimer)
    }, 1000)
  }
  else {
    clearInterval(qrCodeData.checkLoginTimer)
  }
}
// 刷新二维码
async function handle_refreshLoginQrCode() {
  const key = qrKey.value
  const { code, result, msg } = await qrRefresh(key)
  if (code === 200 && result) {
    console.log('二维码刷新成功', result)
    const { key } = result
    qrKey.value = key
    qrCodeStatus.value = 'pending'
  }
  else {
    console.log('二维码刷新失败', msg)
  }

  const qrData = {
    ...result,
  }
  console.log('qrData', qrData)
  QRCode.toDataURL(JSON.stringify(qrData))
    .then((url) => {
      qrImg.value = url // 生成的二维码
    })
    .catch((err) => {
      console.error(err)
    })
  // 轮询检测扫码状态
  getQrCodeState()
}
function afterLogin() {}

// 登录
async function handleLogin() {
  const dataParams = {
    key: qrKey.value,
    userId: 1,
  }
  const { code, result, msg } = await qrLogin(dataParams)
  if (code === 200 && result) {
    console.log('二维码登录成功', result)
  }
  else {
    console.log('二维码登录失败', msg)
  }
}
// 改变二维码状态
async function handle_changeLoginQrCodeStatus() {
  const dataParams = {
    key: qrKey.value,
  }
  const { code, result, msg } = await qrChangeSate(dataParams)
  if (code === 200 && result) {
    console.log('改变二维码状态成功', result)
  }
  else {
    console.log('改变二维码状态失败', msg)
  }
}
// 检查二维码状态
async function handle_checkLoginQrCodeStatus() {
  const { code, result, msg } = await qrCheck(qrKey.value)
  if (code === 200 && result) {
    console.log('二维码状态检查成功', result)
    const { status, data } = result
    qrCodeStatus.value = status
    if (status === 'normal') {
      // 二维码正常
      qrCodeData.loginQRCodeStatus = 'normal'
    }
    else if (status === 'timeout') {
      // 二维码过期
      qrCodeData.loginQRCodeStatus = 'timeout'
      clearQrTimer()
      ElMessage.warning('二维码已过期，请刷新')
    }
    else if (status === 'success') {
      // 二维码登录成功
      qrCodeData.loginQRCodeStatus = 'success'
      const { token, user } = data
      setToken(token)
      userStore.setUserInfo(user)
      ElMessage.success('登录成功')
      clearQrTimer()
      emit('closeDialog')
    }
    else {
      // 二维码登录成功
      qrCodeData.loginQRCodeStatus = 'timeout'
    }
  }
  else {
    console.log('二维码状态检查失败', msg)
  }
}
const qrTimer = ref(null)
// 轮询检测扫码状态
function getQrCodeState() {
  qrTimer.value = setInterval(() => {
    handle_checkLoginQrCodeStatus()
  }, 2000)
}
// 清楚轮询
function clearQrTimer() {
  clearInterval(qrTimer.value)
}
</script>

<template>
  <div class="login-content-code flex flex-col items-center justify-center">
    <div class="desc-title">
      扫码登录
    </div>
    <div class="desc-subtitle">
      请使用<span>移动端app</span>扫描二维码
    </div>
    <div class="qr-code-area relative h-[300px] w-[300px]">
      <!-- <img
        @click="handle_refreshLoginQrCode"
        class="w-full h-full"
        :src="qrImg"
      /> -->
      <div class="qr-cover">
        <div class="qr-coner-1" />
        <div class="qr-coner-2" />
        <div class="qr-coner-3" />
        <div class="qr-coner-4" />
        <el-image
          class="h-full w-full"
          :src="qrImg"
          @click="handle_refreshLoginQrCode"
        >
          <template #placeholder>
            <div class="image-slot">
              Loading<span class="dot">...</span>
            </div>
          </template>
        </el-image>
      </div>

      <!-- 扫码成功遮罩层 -->
      <template v-if="qrCodeStatus === 'confirm'">
        <div
          class="absolute left-0 top-0 h-full w-full flex items-center justify-center"
        >
          <!-- 遮罩层 -->
          <div
            class="absolute left-0 top-0 z-98 h-full w-full bg-white opacity-80"
          />
          <!-- 标识 -->
          <div
            class="i-carbon-checkmark-filled z-99 text-4xl color-[#36bf84]"
          />
        </div>
      </template>
      <!-- 过期遮罩层 -->
      <template v-else-if="qrCodeStatus === 'timeout'">
        <div
          class="absolute left-0 top-0 h-full w-full flex cursor-pointer items-center justify-center backdrop-blur-sm backdrop-filter"
          @click="handle_refreshLoginQrCode"
        >
          <!-- 遮罩层 -->
          <div
            class="absolute left-0 top-0 z-98 h-full w-full bg-black opacity-50"
          />
          <!-- 标识 -->
          <div
            class="i-carbon-warning-filled z-99 text-4xl color-[#ff4d4f]"
          />
          <!-- 刷新 -->
          <div
            class="absolute bottom-10 z-99 w-full flex items-center justify-center color-white"
          >
            点击刷新二维码
          </div>
        </div>
      </template>
      <!-- 登录成功遮罩层 -->
      <template v-else-if="qrCodeStatus === 'success'">
        <div
          class="absolute left-0 top-0 h-full w-full flex items-center justify-center"
        >
          <!-- 遮罩层 -->
          <div
            class="absolute left-0 top-0 z-98 h-full w-full bg-white opacity-80"
          />
          <!-- 标识 -->
          <div
            class="i-carbon-face-wink-filled z-99 text-4xl color-[#36bf84]"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-content-code {
	.desc-title {
		display: flex;
		justify-content: center;
		font-weight: 500;
		font-size: 24px;
		line-height: 32px;
		color: #232d47;
		font-family: 'PingFang SC';
	}
	.desc-subtitle {
		display: flex;
		justify-content: center;
		font-size: 14px;
		line-height: 22px;
		color: #232d47;
		margin-top: 12px;
		margin-bottom: 12px;
		span {
			color: #5b89fe;
			line-height: 22px;
			cursor: pointer;
		}
	}

	.qr-cover {
		border-radius: 7px;
		overflow: hidden;
		height: 300px;
		// width: 160px;
		// height: 160px;
		position: relative;
		display: flex;
		flex-direction: column;
		-webkit-box-pack: center;
		justify-content: center;
		-webkit-box-align: center;
		align-items: center;
		.qr-coner-1 {
			z-index: 1;
			position: absolute;
			height: 16px;
			width: 16px;
			top: 0px;
			left: 0px;
			border-left: 3px solid rgb(91, 146, 225);
			border-top: 3px solid rgb(91, 146, 225);
			border-top-left-radius: 8px;
		}
		.qr-coner-2 {
			z-index: 1;
			position: absolute;
			height: 16px;
			width: 16px;
			top: 0px;
			right: 0px;
			border-right: 3px solid rgb(91, 146, 225);
			border-top: 3px solid rgb(91, 146, 225);
			border-top-right-radius: 8px;
		}
		.qr-coner-3 {
			z-index: 1;
			position: absolute;
			height: 16px;
			width: 16px;
			bottom: 0px;
			right: 0px;
			border-right: 3px solid rgb(91, 146, 225);
			border-bottom: 3px solid rgb(91, 146, 225);
			border-bottom-right-radius: 8px;
		}
		.qr-coner-4 {
			z-index: 1;
			position: absolute;
			height: 16px;
			width: 16px;
			bottom: 0px;
			left: 0px;
			border-left: 3px solid rgb(91, 146, 225);
			border-bottom: 3px solid rgb(91, 146, 225);
			border-bottom-left-radius: 8px;
		}
	}
}
</style>
