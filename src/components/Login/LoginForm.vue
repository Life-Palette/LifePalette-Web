<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useResettaleRef } from 'vue-hooks-pure'
import { register, resetPassword, sendCode, sendCodeEmail } from '~/api/admin'
import { useUserStore } from '~/stores/user'
import { requestTo } from '~/utils/http/tool'

defineProps<Props>()

const emit = defineEmits(['closeDialog'])

const userStore = useUserStore()

interface Props {
	isRegist?: boolean
}

const target = defineModel<'login' | 'regist' | 'forget'>('target', {
	default: 'login',
})

interface RegistForm {
	mobile: string
	code: string
	password: string
	password_confirm: string
}

interface LoginForm {
	account: string
	password: string
}

interface ForgetForm {
	mobile: string
	code: string
	password: string
	password_confirm: string
}

const [registForm, ressetRegistForm] = useResettaleRef<RegistForm>({
	mobile: '',
	code: '',
	password: '',
	password_confirm: '',
})
const [forgetForm, ressetForgetForm] = useResettaleRef<ForgetForm>({
	mobile: '',
	code: '',
	password: '',
	password_confirm: '',
})

const [loginForm, ressetLoginForm] = useResettaleRef<LoginForm>({
	account: '',
	password: '',
})

const text_info = {
	login: {
		title: '登录',
		sub: 'Thanks for using :)',
		icon: '🐇',
		btnText: '登录',
		btnIcon: '🎨',
		successText: '登录成功',
		requestApi: userStore.handLogin,
	},
	regist: {
		title: '注册',
		sub: 'Regist',
		icon: '🐻',
		btnText: '注册',
		btnIcon: '🐻‍❄️',
		successText: '注册成功',
		requestApi: register,
	},
	forget: {
		title: '忘记密码',
		sub: 'Forget',
		icon: '🐻',
		btnText: '找回密码',
		btnIcon: '🐻‍❄️',
		successText: '重置密码成功',
		requestApi: resetPassword,
	},
}

const currentText = computed(() => {
	return text_info[target.value as 'login' | 'regist' | 'forget']
})
const currentForm = computed(() => {
	if (target.value === 'login') {
		return loginForm
	}
	else if (target.value === 'regist') {
		return registForm
	}
	else {
		return forgetForm
	}
})

const currentResetForm = computed(() => {
	if (target.value === 'login') {
		return ressetLoginForm
	}
	else if (target.value === 'regist') {
		return ressetRegistForm
	}
	else {
		return ressetForgetForm
	}
})
async function handleSubmit() {
	console.log('💗handleSubmit---------->')
	if (!checkForm())
    return
	const dataParams = {
		...currentForm.value.value,
		email: currentForm.value.value.mobile,
	}
	const { requestApi, btnText } = currentText.value
		const { code, result, msg, message, statusCode, data }
		= await requestApi(dataParams)
  if (code === 200 && result) {
   const successText = `${btnText}成功`
    ElMessage.success(successText)
    setTarget('login')
		if (target.value === 'login') {
			emit('closeDialog')
		}
  }
else if (code === 403) {
		ElMessage.warning(message)
	}
  else {
    const { statusCode, message, msg: msgT } = data || {}
    if (statusCode === 403) {
      ElMessage.warning(message)
      return
    }
		const msgStr = msgT?.length > 0 ? msgT[0]?.message : `${btnText}失败`

    ElMessage.error(msgStr)
  }
}
function setTarget(val: 'login' | 'regist' | 'forget') {
	target.value = val
	ressetForgetForm()
	ressetLoginForm()
	ressetRegistForm()
}
// 倒计时初始变量
const timer = ref<any | null>(null)
const count = ref(60)
const hasGetCode = ref(false)
const sendLoading = ref(false)
// 开始倒计时
function startCountDown() {
  timer.value = setInterval(() => {
    count.value--
    if (count.value <= 0) {
      clearInterval(timer.value)
      count.value = 60
      timer.value = null
    }
  }, 1000)
}

// 获取验证码
async function getCode() {
	const mobileVal = currentForm.value.value?.mobile

  if (!mobileVal) {
    ElMessage.warning('请输入手机号')
    return false
  }
  sendLoading.value = true
  const dataParams = {
    // mobile: mobileVal,
		email: mobileVal,
  }

// const [err] = await requestTo(sendCode(dataParams))
const [err] = await requestTo(sendCodeEmail(dataParams))
if (err) {
	  ElMessage.error('验证码发送失败')
}
else {
	ElMessage.success('验证码发送成功')
    hasGetCode.value = true
    startCountDown()
}
  sendLoading.value = false
}

// 检验表单
function checkForm() {
	const keys_enum = {
		mobile: '手机号',
		code: '验证码',
		password: '密码',
		password_confirm: '确认密码',
		// password: '新密码',
		// password_confirm: '确认新密码',

	}

	const keys = Object.keys(currentForm.value.value)
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		if (!currentForm.value.value[key]) {
			const key_name = keys_enum[key as keyof typeof keys_enum] || key
			ElMessage.warning(`请输入${key_name}`)
			return false
		}
	}
	// 如果是注册和忘记密码，需要检验两次密码是否一致
	if (target.value === 'regist' || target.value === 'forget') {
		if (currentForm.value.value.password !== currentForm.value.value.password_confirm) {
			ElMessage.warning('两次密码不一致')
			return false
		}
	}
	return true
}
</script>

<template>
	<div class="h-full w-full flex flex-col items-center gap-3">
		<span class="title">Have a good day!</span>
		<span class="sub mb">{{ currentText.title }}</span>
		<div class="flex flex-1 items-center justify-center text-6xl">
			{{ currentText.icon }}
		</div>
		<!-- 注册 -->
		<template v-if="target === 'regist'">
			<input
				v-model="registForm.mobile"
				type="text"
				class="input"
				placeholder="请输入邮箱"
			>

			<input
				v-model="registForm.password"
				type="password"
				class="input"
				maxlength="16"
				placeholder="请输入密码"
			>
			<input
				v-model="registForm.password_confirm"
				type="password"
				class="input"
				maxlength="16"
				placeholder="请再次输入密码"
			>
			<div class="w-full flex gap-3">
				<input
					v-model="registForm.code"
					type="password"
					class="input"
					maxlength="4"
					placeholder="请输入验证码"
				>
				<button class="overlay__btn overlay__btn--colors" @click="getCode">
					<div v-if="timer" class="timer-num">{{ count }}s</div>
					<div v-else class="icey-btn-text">
						{{ hasGetCode ? "重新获取" : "获取验证码" }}
					</div>
				</button>
			</div>
		</template>
		<!-- 登录 -->
		<template v-else-if="target === 'login'">
			<input
				v-model="loginForm.account"
				type="text"
				class="input"
				placeholder="请输入手机号或LP账号"
			>

			<input
				v-model="loginForm.password"
				type="password"
				class="input"
				maxlength="16"
				placeholder="请输入密码"
			>
		</template>
		<!-- 忘记密码 -->
		<template v-else>
			<input
				v-model="forgetForm.mobile"
				type="text"
				class="input"
				placeholder="请输入邮箱(手机号)"
			>

			<input
				v-model="forgetForm.password"
				type="password"
				class="input"
				maxlength="16"
				placeholder="请输入新密码"
			>
			<input
				v-model="forgetForm.password_confirm"
				type="password"
				class="input"
				maxlength="16"
				placeholder="请再次输入新密码"
			>
			<div class="w-full flex gap-3">
				<input
					v-model="forgetForm.code"
					class="input"
					maxlength="4"
					placeholder="请输入验证码"
				>
				<button class="overlay__btn overlay__btn--colors" @click="getCode">
					<div v-if="timer" class="timer-num">{{ count }}s</div>
					<div v-else class="icey-btn-text">
						{{ hasGetCode ? "重新获取" : "获取验证码" }}
					</div>
				</button>
			</div>
		</template>
		<div
			class="tip"
			>
				提示: 手机号因为相关服务商限制,相关短信功能暂已停用(之前注册的手机号可以继续使用手机+密码登录)；后续用户请使用邮箱注册/登录。如遇问题,欢迎请联系作者(WeChat:  restsun)💕。
			</div>
		<!-- 注册 -->
		<div class="box-border w-full flex pr-3">
<div class="flex-1" />
			<div
				v-if="target === 'login'"
				class="cursor-pointer"
				@click="setTarget('regist')"
			>
				注册账号
			</div>
			<div v-else class="cursor-pointer" @click="setTarget('login')">登录</div>
			<div class="cursor-pointer ml-2" @click="setTarget('forget')">
				忘记密码
			</div>
		</div>

		<button class="overlay__btn overlay__btn--colors" @click="handleSubmit">
			<span>{{ currentText.btnText }}</span>
			<span class="overlay__btn-emoji">{{ currentText.btnIcon }}</span>
		</button>
	</div>
</template>

<style lang="less" scoped>
.title {
	color: black;
	font-weight: bold;
	text-align: center;
	font-size: 20px;
	margin-bottom: 4px;
}

.sub {
	text-align: center;
	color: black;
	font-size: 14px;
	width: 100%;
}

.sub.mb {
	margin-bottom: 1px;
}

.sub a {
	color: rgb(23, 111, 211);
}

// .input,
// button {

//   cursor: pointer;
//   border: none;
//   outline: none;
//   width: 100%;
//   padding: 16px 10px;
//   background-color: rgb(247, 243, 243);
//   border-radius: 10px;
//   box-shadow: 12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
//     100px 100px 80px rgba(0, 0, 0, 0.03);
// }

// button {
//   margin-top: 12px;
//   background-color: rgb(23, 111, 211);
//   color: #fff;
//   text-transform: uppercase;
//   font-weight: bold;
// }

.input {
	box-sizing: border-box;
	border: 1px solid transparent;
	cursor: pointer;

	outline: none;
	width: 100%;
	padding: 16px 10px;
	background-color: rgb(247, 243, 243);

	border-radius: 10px;
	box-shadow:
		12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
		100px 100px 80px rgba(0, 0, 0, 0.03);
	&:focus {
		border: 1px solid rgb(23, 111, 211);
	}
}

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
.tip{
	font-size: 12px;
	color: #999;
}
</style>
