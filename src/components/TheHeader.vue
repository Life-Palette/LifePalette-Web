<script setup>
import ImgLogo from '~/assets/image/logo/logo.svg'
import { useUserStore } from '~/stores/user'
import { ElMessage } from 'element-plus'
import LoginDialog from './Login/LoginDialog.vue'
// import PopperNews from "~/components/Popper/News.vue";
import PopperNews from '~/components/Popper/index.vue'
// import { Search } from '@element-plus/icons-vue'
const userStore = useUserStore()

const { userInfo } = storeToRefs(userStore)

onMounted(() => {})

const isShowDialog = ref(false)
const input1 = ref('')

const isDropdown = ref(false)
const handleVisible = (val) => {
	isDropdown.value = val
}
const handleVisible2 = (val) => {
	isDropdown.value = val
}
// 退出登录
const handleLogout = () => {
	userStore.logout()
}
// 是否登录
const isLogin = computed(() => {
	return userInfo.value?.name
})
const loginLoading = ref(false)
// login
const handleLogin = async () => {
	isShowDialog.value = true
}

const newsRef = ref(null)
const newClick = () => {
	if (newsRef.value) {
		console.log('🌈----------newClick ')
	}
}
</script>

<template>
	<div
		:class="isDark ? 'header-dark' : 'header-normal'"
		class="z-999 box-border h-[55px] w-full flex items-center overflow-hidden px-[40px]"
	>
		<div v-motion-roll-bottom h-full font-bold text="2xl">
			<!-- Wow🌟! -->
			<img :src="ImgLogo" class="ml-4 h-full w-full scale-300" />
		</div>
		<div flex-1>
			<!-- <el-input
				v-model="input1"
				class="m-2 w-50"
				placeholder="搜索更多美好事物~"
			/> -->
		</div>
		<div class="h-full flex items-center gap-5">
			<div
				i-carbon-sun
				dark:i-carbon-moon
				icon-btn
				title="Change Theme"
				@click="toggleDark()"
			/>
			<a
				i-carbon-logo-github
				icon-btn
				rel="noreferrer"
				href="https://github.com/IceyWu"
				target="_blank"
				title="GitHub"
			/>
			<!-- 消息 -->
			<template v-if="isLogin">
				<PopperNews />
			</template>
		</div>
		<!-- 头像 -->
		<div v-loading="loginLoading" class="ml-5 flex cursor-pointer items-center">
			<!-- 已登录 -->
			<template v-if="isLogin">
				<div class="flex items-center border-none">
					<el-dropdown trigger="hover" @visible-change="handleVisible">
						<!-- 头像 -->
						<div class="flex items-center justify-start border-none">
							<el-avatar
								:size="35"
								:src="userInfo?.avatar"
								:alt="userInfo.name"
							/>
							<span class="navbar-bg-hover el-dropdown-link select-none">
								<div
									class="inline-block bg-black text-[1.1em] dark:bg-white"
									:class="
										isDropdown ? 'i-carbon-caret-up' : 'i-carbon-caret-down'
									"
								/>
							</span>
						</div>

						<template #dropdown>
							<el-dropdown-menu class="logout" @visible-change="handleVisible2">
								<el-dropdown-item class="h-[30px]">
									<p class="i-material-symbols-lock-outline"></p>
									<p class="ml-2">修改密码</p>
								</el-dropdown-item>
								<el-dropdown-item class="h-[30px]" @click="handleLogout">
									<p class="i-grommet-icons-power-shutdown"></p>
									<p class="ml-2">退出</p>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</template>
			<!-- 未登录 -->
			<template v-else>
				<div @click="handleLogin">
					<el-avatar :size="30"> 登录 </el-avatar>
				</div>
			</template>
		</div>
		<LoginDialog v-if="isShowDialog" v-model:isShowDialog="isShowDialog" />
	</div>
</template>

<style lang="less" scoped>
.header-normal {
	background-image: radial-gradient(transparent 1px, #fff 1px);

	background-size: 4px 4px;
	backdrop-filter: saturate(50%) blur(4px);
	border-bottom: 1px solid #dcdfe6;
}
.header-dark {
	background-image: radial-gradient(transparent 1px, #141414 1px);
	background-size: 4px 4px;
	backdrop-filter: saturate(50%) blur(4px);

	border-bottom: 1px solid #4c4d4f;
}

:focus {
	outline: 0 !important;
}

.w-50 {
	width: 400px;
	height: 40px;

	.el-input__inner {
		border: none;
	}
	:deep(.el-input__wrapper) {
		border-radius: 9999px;
		font-size: 16px;
		padding-left: 20px;
	}
	:deep(.el-input__icon) {
		width: 20px !important;
		margin-right: 10px;
	}
	:deep(.el-icon svg) {
		height: 2em;
		width: 2em;
		color: rgba(51, 51, 51, 0.8);
	}
}
:deep(.el-input__wrapper.is-focus) {
	box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
		inset;
}
:deep(.el-input__wrapper:hover) {
	box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
		inset;
}
</style>
