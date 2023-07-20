<template>
  <el-dialog append-to-body v-model="dialogVisible" title="Tips" width="350px" top="40vh" @close="closeDialog">
    <div class="content">
      <div class="login-box">
        <div class="My-title">编辑个人资料</div>
        <form>
          <div class="user-box">
            <input type="text" name="" required="" v-model="Myname">
            <label>姓名</label>
          </div>

          <div class="user-box">
            <input type="text" name="" required="">
            <label>性别</label>
          </div>
          <div></div>
          <div class="user-box">
            <input type="text" name="" required="">
            <label>个性签名</label>
          </div>
        </form>
        <div><button>取消</button></div>
        <div><button @click="submit">确定</button></div>
      </div>
    </div>
  </el-dialog>
</template>
  
<script setup>
const props = defineProps({
  isShowDialog: {
    type: Boolean,
    default: true,
  },
});
const dialogVisible = ref(true);
const emit = defineEmits(["update:isShowDialog"]);
// 可疑
const closeDialog = () => {
  emit("update:isShowDialog", false);
};
const Myname = ref('')
// 获取表单信息
const submit = () => {

  console.log(Myname.value);
}
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
  box-shadow: 0 15px 25px rgba(0, 0, 0, .6);
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
  color: #e4b51a;
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
  transition: .5s;
}

.login-box .user-box input:focus~label,
.login-box .user-box input:valid~label {
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
</style>
  
 