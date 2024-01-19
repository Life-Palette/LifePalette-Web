<template>
	<el-dialog
		v-model="dialogVisible"
		append-to-body
		title="Tips"
		width="350px"
		top="40vh"
		@close="closeDialog"
	>
		<div class="content">
			<div class="login-box">
				<div class="My-title">编辑个人资料</div>
				<form>
					<div class="user-box">
						<input v-model="Myname" type="text" name="" required="" />
						<label>姓名</label>
					</div>

					<div class="user-box">
						<input type="text" name="" required="" />
						<label>性别</label>
					</div>
					<div></div>

					<div class="user-box">
						<input type="text" name="" required="" />
						<label>职业</label>
					</div>

					<div class="user-box">
						<input type="text" name="" required="" />
						<label>所在地</label>
					</div>

					<div class="user-box">
						<input type="text" name="" required="" />
						<label>邮箱</label>
					</div>
					<div class="user-box">
						<input v-model="Personal" type="text" name="" required="" />
						<label>个性签名</label>
					</div>
				</form>

				<div class="butt">
					<section class="post-up">
						<button class="overlay__btn overlay__btn--colors" @click="close">
							<span>取消</span>
							<span class="overlay__btn-emoji">💕</span>
						</button>
					</section>

					<span class="gap"></span>

					<section class="post-btn">
						<button
							class="overlay__btn overlay__btn--colors"
							@click="updateUserInfoFunc"
						>
							<span>发布</span>
							<span class="overlay__btn-emoji">💕</span>
						</button>
					</section>
				</div>
			</div>
		</div>
	</el-dialog>
</template>

<script setup>
import { updateUserInfo } from '~/api/admin'

const dialogVisible = ref(true)
const Myname = ref('')
// const Sexradio = ref('1')
const Personal = ref('')

const props = defineProps({
	isShowDialog: {
		type: Boolean,
		default: true,
	},
	userInfo: {
		type: Object,
		default: () => {},
	},
})

const emit = defineEmits(['update:isShowDialog', 'update:userInfo'])

const closeDialog = () => {
	emit('update:isShowDialog', false)
}

// 修改信息
const updateUserInfoFunc = async () => {
	const params = {
		name: Myname.value,
		// sex:  Sexradio.value,
	}
	const { code, msg, result } = ({} = await updateUserInfo(params).catch(
		(err) => {
			console.log('err', err)
			ElMessage.error('更新用户信息失败')
		},
	))
	if (code === 200) {
		console.log('更新用户信息成功', result)
		emit('update:userInfo', result)

		ElMessage.success('更新用户信息成功')
	} else {
		console.log('更新用户信息失败', msg)
		ElMessage.error('更新用户信息失败')
	}
	close()
}

const close = () => {
	// 关闭
	dialogVisible.value = false
}
onMounted(() => {
	console.log('props.userInfo------------', props.userInfo)
	const { name } = props.userInfo
	Myname.value = name
})
</script>

<style lang="less" scoped>
.login-box {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 500px;
	padding: 40px;
	transform: translate(-50%, -50%);
	background: rgba(255, 255, 255, 0.775);
	box-sizing: border-box;
	box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
	border-radius: 10px;
}

.My-title {
	margin-bottom: 30px;
}

.login-box .user-box {
	position: relative;
}

.login-box .user-box input {
	width: 100%;
	padding: 10px 0;
	font-size: 16px;
	color: #020100;
	margin-bottom: 30px;
	border: none;
	border-bottom: 1px solid #fff;
	outline: none;
	background: transparent;
}

.login-box .user-box label {
	position: absolute;
	top: 0;
	left: 0;
	padding: 10px 0;
	font-size: 16px;
	color: #e26c1d;

	pointer-events: none;
	transition: 0.5s;
}

.login-box .user-box input:focus ~ label,
.login-box .user-box input:valid ~ label {
	top: -30px;
	left: 0;
	color: #b8bdba;
	color: #606266;
	font-size: 20px;
	font-weight: 900;
}

// .login-box form a {
//   position: relative;
//   display: inline-block;
//   padding: 10px 20px;
//   color: #ffffff;
//   font-size: 16px;
//   text-decoration: none;
//   text-transform: uppercase;
//   overflow: hidden;
//   transition: .5s;
//   margin-top: 40px;
//   letter-spacing: 4px
// }
.butt {
	display: flex;
	.post-btn {
		width: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
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
	}
	.gap {
		width: 25px;
	}
	.post-up {
		width: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		.overlay__btn {
			margin-top: 6px;
			width: 100%;
			height: 2.5rem;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 0.875rem;
			font-weight: 600;

			// background: hsl(276, 100%, 9%);
			background-color: hsla(276, 100%, 64%, 0.2);
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
	}
}
</style>
