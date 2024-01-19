<template>
	<el-dialog
		v-model="dialogVisible"
		append-to-body
		title="Tips"
		width="350px"
		top="20vh"
		class="no-dlg-bg-class"
		@close="closeDialog"
	>
		<div
			class="form-box"
			:style="{
				// isRegist: 'height: 540px !important;',
				height: isRegist ? '540px !important;' : '450px !important;',
			}"
		>
			<div class="corner" @click="isAccountLogin = !isAccountLogin">
				<img
					class="corner-img"
					:src="isAccountLogin ? ImgLoginAccount : ImgLoginQr"
					alt=""
				/>
			</div>
			<!-- 账号密码登录 -->
			<template v-if="isAccountLogin">
				<LoginForm
					v-model:isRegist="isRegist"
					@start-regist="startRegist"
					@close-dialog="closeDialog"
				/>
			</template>
			<!-- 扫码登录 -->
			<template v-else>
				<LoginQR @close-dialog="closeDialog" />
			</template>
		</div>
	</el-dialog>
</template>

<script setup>
import ImgLoginAccount from '~/assets/image/login/account.svg'
import ImgLoginQr from '~/assets/image/login/qr.svg'
import LoginForm from '~/components/Login/LoginForm.vue'
import LoginQR from '~/components/Login/LoginQr.vue'
const props = defineProps({
	isShowDialog: {
		type: Boolean,
		default: true,
	},
})

const emit = defineEmits(['update:isShowDialog'])

const dialogVisible = ref(true)
const isRegist = ref(false)

// 是否是账号密码登录
const isAccountLogin = ref(true)

const closeDialog = () => {
	emit('update:isShowDialog', false)
}
</script>

<style lang="less" scoped>
.form-box {
	// height: 450px;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
	gap: 10px;
	width: 350px;
	padding: 30px 30px;
	background: rgba(255, 255, 255, 0.775);
	box-shadow: 0 0.75rem 2rem 0 rgba(0, 0, 0, 0.1);
	border-radius: 15px;
	border: 1px solid rgba(255, 255, 255, 0.125);
	//   高斯模糊
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	position: relative;
	overflow: hidden;
	.corner {
		cursor: pointer;
		position: absolute;
		top: 0px;
		right: 0px;
		width: 40px;
		height: 40px;
		box-shadow: 0 0.75rem 2rem 0 rgba(0, 0, 0, 0.1);
		img {
			width: 100%;
			height: 100%;
		}
	}
}
</style>

<style lang="less">
.no-dlg-bg-class {
	background: none !important;
	.el-dialog__header {
		display: none;
	}
	.el-dialog__body {
		padding: 0;
	}
}
</style>
