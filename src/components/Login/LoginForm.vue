<script setup>
import { ElMessage } from 'element-plus'
import { register, sendCode } from '~/api/admin'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  isRegist: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['closeDialog', 'startRegist', 'update:isRegist'])
const userStore = useUserStore()
onMounted(() => {})

const sendLoading = ref(false)
const registLoading = ref(false)
// 倒计时初始变量
const timer = ref(null)
const count = ref(60)
const hasGetCode = ref(false)

const registForm = reactive({
  mobile: '',
  code: '',
  password: '',
  password_confirm: '',
})

const loginForm = ref({
  username: '',
  password: '',
})
const loginLoading = ref(false)
async function handleLogin() {
  // 表单校验
  if (!valForm() || loginLoading.value)
    return
  loginLoading.value = true
  const params = {
    account: loginForm.value.username,
    password: loginForm.value.password,
  }
  try {
    const { code, msg, result } = ({} = await userStore.handLogin(params))
    if (code === 200) {
      toast.success('登录成功')
      emit('closeDialog')
    }
    else {
      console.log('登录失败', msg)
      //    判断msg是否为数组
      if (Array.isArray(msg)) {
        const msgDes = msg.length > 0 ? msg[0]?.message : '登录失败'

        toast.error(msgDes)
      }
      else {
        toast.error('登录失败')
      }
    }
    loginLoading.value = false
  }
  catch (error) {
    toast.warning('登录失败,账号或密码错误🐻‍❄️')
    loginLoading.value = false
  }
}
// 表单校验
function valForm() {
  const { username, password } = loginForm.value
  if (!username) {
    ElMessage.error('请输入账号')
    return false
  }
  if (!password) {
    ElMessage.error('请输入密码')
    return false
  }
  return true
}
// 检验表单
function checkForm() {
  if (!registForm.mobile) {
    ElMessage.warning('请输入手机号')
    return false
  }
  if (!registForm.code) {
    ElMessage.warning('请输入验证码')
    return false
  }
  if (!registForm.password) {
    ElMessage.warning('请输入密码')
    return false
  }
  if (!registForm.password_confirm) {
    ElMessage.warning('请再次输入密码')
    return false
  }
  if (registForm.password !== registForm.password_confirm) {
    ElMessage.warning('两次密码不一致')
    return false
  }
  return true
}

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
  if (!registForm.mobile) {
    ElMessage.warning('请输入手机号')
    return false
  }
  sendLoading.value = true
  const dataParams = {
    mobile: registForm.mobile,
  }
  // console.log("dataParams", dataParams);
  // const res = (await sendCode(dataParams)) as any;
  // console.log("res", res);
  const { code, result, msg } = await sendCode(dataParams)
  if (code === 200 && result) {
    console.log('获取验证码成功', result)
    ElMessage.success('验证码发送成功')
    hasGetCode.value = true
    startCountDown()
  }
  else {
    console.log('获取验证码失败', msg)
    ElMessage.error('验证码发送失败')
  }
  sendLoading.value = false
}

// 提交
async function handleRegist() {
  if (!checkForm())
    return
  registLoading.value = true
  const dataParams = {
    ...registForm,
  }
  const { code, result, msg, message, statusCode, data }
		= await register(dataParams)
  if (code === 200 && result) {
    console.log('注册成功', result)
    ElMessage.success('注册成功')
    handleRigist()
  }
  else {
    console.log('注册失败', msg, data)
    const { statusCode, message, msg: msgT } = data
    if (statusCode === 403) {
      ElMessage.warning(message)
      return
    }
    const msgStr = msgT.length > 0 ? msgT[0]?.message : '注册失败'

    ElMessage.error(msgStr)
  }
  registLoading.value = false
  // emit("getCodeDone", {
  //   ...registForm,
  // });
}
function handleRigist() {
  // emit("startRegist");
  // isRegist.value = !isRegist.value;
  emit('update:isRegist', !props.isRegist)

  clearInterval(timer.value)
  count.value = 60
  timer.value = null
  hasGetCode.value = false
  registForm.mobile = ''
  registForm.code = ''
  registForm.password = ''
  registForm.password_confirm = ''
}
</script>

<template>
  <div class="h-full w-full flex flex-col items-center gap-3">
    <span class="title">Have a good day!</span>
    <span class="sub mb">{{
      isRegist ? 'Regist' : 'Thanks for using :)'
    }}</span>
    <div class="flex flex-1 items-center justify-center text-6xl">
      {{ isRegist ? '🐻' : '🐇' }}
    </div>

    <template v-if="isRegist">
      <input
        v-model="registForm.mobile"
        type="text"
        maxlength="11"
        class="input"
        placeholder="请输入手机号"
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
          <div v-if="timer" class="timer-num">
            {{ count }}s
          </div>
          <div v-else class="icey-btn-text">
            {{ hasGetCode ? '重新获取' : '获取验证码' }}
          </div>
        </button>
      </div>
    </template>
    <template v-else>
      <input
        v-model="loginForm.username"
        type="text"
        maxlength="11"
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

    <!-- 注册 -->
    <div class="box-border w-full flex pr-3">
      <div class="flex-1" />
      <div class="cursor-pointer" @click="handleRigist">
        {{ !isRegist ? '注册账号' : '登录' }}
      </div>
    </div>
    <!-- <button @click="handleLogin">登录</button> -->
    <template v-if="isRegist">
      <button class="overlay__btn overlay__btn--colors" @click="handleRegist">
        <span>注册</span>
        <span class="overlay__btn-emoji">🐻‍❄️</span>
      </button>
    </template>
    <template v-else>
      <button class="overlay__btn overlay__btn--colors" @click="handleLogin">
        <span>登录</span>
        <span class="overlay__btn-emoji">🎨</span>
      </button>
    </template>
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
</style>
