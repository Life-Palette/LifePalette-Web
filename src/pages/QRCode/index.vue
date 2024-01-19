<template>
	<div class="login-content_code flex flex-col items-center justify-center">
		<h1>打开XXAPP扫描二维码登录</h1>
		<div class="qr-code-area relative h-[300px] w-[300px]">
			<img
				class="h-full w-full"
				:src="qrImg"
				@click="handle_refreshLoginQrCode"
			/>

			<!-- 扫码成功遮罩层 -->
			<template v-if="qrCodeStatus === 'confirm'">
				<div
					class="absolute left-0 top-0 h-full w-full flex items-center justify-center"
				>
					<!-- 遮罩层 -->
					<div
						class="absolute left-0 top-0 z-98 h-full w-full bg-white opacity-80"
					></div>
					<!-- 标识 -->
					<div
						class="i-carbon-checkmark-filled z-99 text-4xl color-[#36bf84]"
					></div>
				</div>
			</template>
			<!-- 过期遮罩层 -->
			<template v-else-if="qrCodeStatus === 'timeout'">
				<div
					class="absolute left-0 top-0 h-full w-full flex cursor-pointer items-center justify-center"
					@click="handle_refreshLoginQrCode"
				>
					<!-- 遮罩层 -->
					<div
						class="absolute left-0 top-0 z-98 h-full w-full bg-black opacity-50"
					></div>
					<!-- 标识 -->
					<div
						class="i-carbon-warning-filled z-99 text-4xl color-[#ff4d4f]"
					></div>
					<!-- 刷新 -->
					<div class="absolute bottom-10 z-99 w-full color-white">
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
					></div>
					<!-- 标识 -->
					<div
						class="i-carbon-face-wink-filled z-99 text-4xl color-[#36bf84]"
					></div>
				</div>
			</template>
		</div>

		<!-- 登录 -->
		<el-button class="login-btn" type="primary" @click="handleLogin">
			登录
		</el-button>
		<!-- 改变二维码状态 -->
		<el-button
			class="login-btn"
			type="primary"
			@click="handle_changeLoginQrCodeStatus"
		>
			改变二维码状态
		</el-button>
	</div>
</template>

<script setup>
import axios from 'axios'
import { qrGenerate, qrRefresh, qrCheck, qrLogin, qrChangeSate } from '~/api/qr'
import QRCode from 'qrcode'
import { ElMessage } from 'element-plus'
import { useUserStore } from '~/stores/user'
import { setToken, getToken, removeToken, formatToken } from '~/utils/auth'
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

async function getLoginQrCode() {
	const { code, result, msg } = await qrGenerate()
	if (code === 200 && result) {
		console.log('二维码生成成功', result)
		const { key } = result
		qrKey.value = key
	} else {
		console.log('二维码生成失败', msg)
	}

	qrCodeData.qrToken = ''
	QRCode.toDataURL(
		JSON.stringify({
			...result,
			copyright: 'app',
			function: 'pc_login',
		}),
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
			let res = axios.post({})

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
	} else {
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
	} else {
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
const handleLogin = async () => {
	const dataParams = {
		key: qrKey.value,
		userId: 1,
	}
	const { code, result, msg } = await qrLogin(dataParams)
	if (code === 200 && result) {
		console.log('二维码登录成功', result)
	} else {
		console.log('二维码登录失败', msg)
	}
}
// 改变二维码状态
const handle_changeLoginQrCodeStatus = async () => {
	const dataParams = {
		key: qrKey.value,
	}
	const { code, result, msg } = await qrChangeSate(dataParams)
	if (code === 200 && result) {
		console.log('改变二维码状态成功', result)
	} else {
		console.log('改变二维码状态失败', msg)
	}
}
// 检查二维码状态
const handle_checkLoginQrCodeStatus = async () => {
	const { code, result, msg } = await qrCheck(qrKey.value)
	if (code === 200 && result) {
		console.log('二维码状态检查成功', result)
		const { status, data } = result
		qrCodeStatus.value = status
		if (status === 'normal') {
			// 二维码正常
			qrCodeData.loginQRCodeStatus = 'normal'
		} else if (status === 'timeout') {
			// 二维码过期
			qrCodeData.loginQRCodeStatus = 'timeout'
			clearQrTimer()
			ElMessage.warning('二维码已过期，请刷新')
		} else if (status === 'success') {
			// 二维码登录成功
			qrCodeData.loginQRCodeStatus = 'success'
			const { token, user } = data
			setToken(token)
			userStore.setUserInfo(user)
			ElMessage.success('登录成功')
			clearQrTimer()
		} else {
			// 二维码登录成功
			qrCodeData.loginQRCodeStatus = 'timeout'
		}
	} else {
		console.log('二维码状态检查失败', msg)
	}
}
const qrTimer = ref(null)
// 轮询检测扫码状态
const getQrCodeState = () => {
	qrTimer.value = setInterval(() => {
		handle_checkLoginQrCodeStatus()
	}, 2000)
}
// 清楚轮询
const clearQrTimer = () => {
	clearInterval(qrTimer.value)
}
</script>
