<script setup lang="ts">
import { updateUserInfo } from '~/api/admin'
import { isObject } from '@iceywu/utils'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const userInfoTemp = ref(userInfo.value)
const dialogVisible = defineModel(false)

onMounted(() => {
  // console.log('🍪-----userInfoTemp.value-----', userInfoTemp.value)
})

// 获取用户信息
async function getMyInfoFunc() {
  const params = {}
  const { code, msg, result } = ({} = await getMyInfo())
  if (code === 200) {
    userStore.setUserInfo(result)
  }
  else {
  }
}
async function onConfirm(data: any) {
  console.log('🐳-----data-----', data)

  const { fileMd5 } = data

  await updateUserInfoFunc(fileMd5)
  getMyInfoFunc()
}

const Aname = ref('')
const Brief = ref('')
// const setformitem = ([
//   {
//     name: "名字",
//     type: input
//   },
//   {
//     name:'简介',
//     type: textarea
//   }
// ])

// 修改信息
// async function updateUserInfoFunc() {
//   const params = compareObjects(userInfo.value, userInfoTemp.value)
//   const [err, suData] = await to(updateUserInfo(params))
//   const { code, msg, result } = suData || {}
//   if (code === 200) {
//     toast.success('修改成功')
//   }
//   else {
//     toast.error('修改失败')
//   }
//   dialogVisible.value = false
// }

// 上传头像
const editTarget = ref(null)
const clipperRef = ref(null)
const clipperData = {
  type: 'browserLogo', // 该参数可根据实际要求修改类型
  allowTypeList: ['png', 'jpg', 'jpeg', 'peeee'], // 允许上传的图片格式
  previewWidth: 100, // 预览宽度
}
// 回显
const userheadUpload = computed(() => {
  const { avatarInfo, avatar } = userInfo.value as any
  return isObject(avatarInfo) ? avatarInfo?.url : avatar
})
function headUpload() {
  editTarget.value = 'avatarFileMd5'
  if (clipperRef.value) {
    clipperRef.value.uploadFile()
  }
}

// 更新用户信息
const updateLoading = ref(false)
async function updateUserInfoFunc(fileMd5: string) {
  if (updateLoading.value)
    return
  updateLoading.value = true
  const params = {
    // backgroundInfoFileMd5: fileMd5,
    // avatarFileMd5:
    // name: "suan",
    // avatar,
    // // github: null,
    // // wakatime: null,
    // // wechat: null,
    // // gitee: null,
    // // qq: "3128006406@qq.com",
  }
  // if(editTarget.value === 'background'){
  // 	params['backgroundInfoFileMd5'] = fileMd5
  // }
  // if(editTarget.value === 'avatar'){
  // 	params['avatarFileMd5'] = fileMd5
  // }
  params[editTarget.value] = fileMd5
  // console.log('🐳-----params-----', params);
  // return
  const { code, msg, result } = ({} = await updateUserInfo(params).catch(
    (err) => {
      updateLoading.value = false
      ElMessage.error('更新用户信息失败')
    },
  ))
  if (code === 200) {
    ElMessage.success('更新用户信息成功')
  }
  else {
    ElMessage.error('更新用户信息失败')
  }
  updateLoading.value = false
}
</script>

<template>
  <!-- <el-dialog
    v-model="dialogVisible"
    append-to-body
    title="Tips"
    width="350px"
    top="40vh"
    :z-index="999"
    @close="dialogVisible = false"
>
    <div class="content">
      <div class="login-box">
        <div class="My-title">
          编辑个人资料
        </div>
        <form>
          <div class="user-box">
            <input v-model="userInfoTemp.userId" type="text" name="" required="">
            <label>账号</label>
          </div>
          <div class="user-box">
            <input v-model="userInfoTemp.name" type="text" name="" required="">
            <label>姓名</label>
          </div>

          <div class="user-box">
            <input type="text" name="" required="">
            <label>性别</label>
          </div>
          <div />

          <div class="user-box">
            <input type="text" name="" required="">
            <label>职业</label>
          </div>

          <div class="user-box">
            <input type="text" name="" required="">
            <label>所在地</label>
          </div>

          <div class="user-box">
            <input type="text" name="" required="">
            <label>邮箱</label>
          </div>
          <div class="user-box">
            <input v-model="userInfoTemp.signature" type="text" name="" required="">
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

          <span class="gap" />

          <section class="post-btn">
            <button
              class="overlay__btn overlay__btn--colors"
              @click="updateUserInfoFunc"
            >
              <span>修改</span>
              <span class="overlay__btn-emoji">💕</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  </el-dialog> -->

  <clipperDialog
ref="clipperRef" :type="clipperData.type" :allow-type-list="clipperData.allowTypeList"
    :limit-size="clipperData.limitSize" :preview-width="clipperData.previewWidth" @confirm="onConfirm"
/>

  <el-dialog
v-model="dialogVisible" destroy-on-close width="550" align-center
    :style="{ borderRadius: '25px', height: '600px' }"
>
    <div class="dialog-content">
      <div class="dialog-title">编辑资料</div>
      <div class="dialog-hadImg">
        <img :src="userheadUpload" alt="" class="item-img" @click="headUpload">
        <p class="item-txt">点击修改头像</p>
      </div>

      <div class="dialog-name">
        <div>名字</div>
        <el-input v-model="Aname" placeholder="填写信息" maxlength="20" type="text" show-word-limit />
      </div>

      <div class="dialog-Personality">
        <div>简介</div>
        <el-input v-model="Brief" placeholder="介绍一下你自己" type="textarea" />
      </div>

      <div class="dialog-footer">
        <div class="Cancel dialog-btn" @click="dialogVisible = false">取消</div>
        <div class="Confirm dialog-btn">保存</div>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="less" scoped>
// .login-box {
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   width: 500px;
//   padding: 40px;
//   transform: translate(-50%, -50%);
//   background: rgba(255, 255, 255, 0.775);
//   box-sizing: border-box;
//   box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
//   border-radius: 10px;
// }

// .My-title {
//   margin-bottom: 30px;
// }

// .login-box .user-box {
//   position: relative;
// }

// .login-box .user-box input {
//   width: 100%;
//   padding: 10px 0;
//   font-size: 16px;
//   color: #020100;
//   margin-bottom: 30px;
//   border: none;
//   border-bottom: 1px solid #fff;
//   outline: none;
//   background: transparent;
// }

// .login-box .user-box label {
//   position: absolute;
//   top: 0;
//   left: 0;
//   padding: 10px 0;
//   font-size: 16px;
//   color: #e26c1d;

//   pointer-events: none;
//   transition: 0.5s;
// }

// .login-box .user-box input:focus ~ label,
// .login-box .user-box input:valid ~ label {
//   top: -30px;
//   left: 0;
//   color: #b8bdba;
//   color: #606266;
//   font-size: 20px;
//   font-weight: 900;
// }

// // .login-box form a {
// //   position: relative;
// //   display: inline-block;
// //   padding: 10px 20px;
// //   color: #ffffff;
// //   font-size: 16px;
// //   text-decoration: none;
// //   text-transform: uppercase;
// //   overflow: hidden;
// //   transition: .5s;
// //   margin-top: 40px;
// //   letter-spacing: 4px
// // }
// .butt {
//   display: flex;
//   .post-btn {
//     width: 50%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     .overlay__btn {
//       margin-top: 6px;
//       width: 100%;
//       height: 2.5rem;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       font-size: 0.875rem;
//       font-weight: 600;

//       background: hsl(276, 100%, 9%);
//       color: hsl(0, 0%, 100%);
//       border: none;
//       border-radius: 0.5rem;
//       transition: transform 450ms ease;
//     }

//     .overlay__btn:hover {
//       transform: scale(1.05);
//       cursor: pointer;
//     }

//     .overlay__btn-emoji {
//       margin-left: 0.375rem;
//     }
//   }
//   .gap {
//     width: 25px;
//   }
//   .post-up {
//     width: 50%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     .overlay__btn {
//       margin-top: 6px;
//       width: 100%;
//       height: 2.5rem;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       font-size: 0.875rem;
//       font-weight: 600;

//       // background: hsl(276, 100%, 9%);
//       background-color: hsla(276, 100%, 64%, 0.2);
//       color: hsl(0, 0%, 100%);
//       border: none;
//       border-radius: 0.5rem;
//       transition: transform 450ms ease;
//     }

//     .overlay__btn:hover {
//       transform: scale(1.05);
//       cursor: pointer;
//     }

//     .overlay__btn-emoji {
//       margin-left: 0.375rem;
//     }
//   }
// }

:deep(.el-dialog) {
  height: 550px;
}

.dialog-content {
  padding: 0 25px;

  .dialog-title {
    text-align: left;
    font-size: 18px;
  }

  .dialog-hadImg {
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 10px;

    .item-img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }

    .item-txt {
      margin-top: 5px;
      font-size: 12px;
      color: rgba(22 24 35 / 60%);
    }
  }

  .dialog-name {
    margin-top: 40px;
    text-align: left;

    :deep(.el-input__wrapper) {
      width: 100%;
      height: 32px;
      background: #f2f2f4;
      border: none;
      border-radius: 10px;
      outline: none;
      padding-left: 8px;
      font-size: 14px;
      line-height: 32px;
      box-shadow: none;
      margin-top: 10px;
    }

    :deep(.el-input__count-inner) {
      background: #f2f2f4;
    }
  }

  .dialog-Personality {
    text-align: left;
    margin-top: 40px;

    :deep(.el-textarea__inner) {
      width: 100%;
      height: 90px;
      max-height: 120px;
      background: #f2f2f4;
      border: none;
      border-radius: 10px;
      outline: none;
      padding-left: 8px;
      font-size: 14px;
      box-shadow: none;
      margin-top: 10px;
      scrollbar-width: none;
      /*firefox*/
      -ms-overflow-style: none;
      /*IE 10+ */
      overflow-x: hidden;
      overflow-y: auto;
    }

    :deep(.el-input__count-inner) {
      background: #f2f2f4;
    }
  }

  :deep(.el-textarea__inner)::-webkit-scrollbar {
    display: none;
    /*chrome safari */
  }

  .dialog-footer {
    display: flex;
    justify-content: space-around;
    margin-top: 45px;

    .dialog-btn {
      width: 135px;
      height: 40px;
      text-align: center;
      line-height: 40px;
      border-radius: 15px;
      cursor: pointer;
    }

    .Cancel {
      background-color: #faf8f8;
      box-shadow: 0px 8px 14px 0px rgba(164, 164, 164, 0.25);

      &:hover {
        background-color: #f6f6f6;
      }
    }

    .Confirm {
      color: #f6f6f6;
      background-color: #f2cacd;
    }
  }
}
</style>
