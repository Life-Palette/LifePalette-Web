<script setup>
import ImgLogo from "~/assets/image/logo/logo.svg";
import { useUserStore } from "~/store/user";
import { ElMessage } from "element-plus";
import LoginDialog from "./Login/LoginDialog.vue";
// import PopperNews from "~/components/Popper/News.vue";
import PopperNews from "~/components/Popper/index.vue";
const userStore = useUserStore();

const { userInfo } = storeToRefs(userStore);

onMounted(() => {});

const isShowDialog = ref(false);

const isDropdown = ref(false);
const handleVisible = (val) => {
  isDropdown.value = val;
};
const handleVisible2 = (val) => {
  isDropdown.value = val;
};
// 退出登录
const handleLogout = () => {
  userStore.logout();
};
// 是否登录
const isLogin = computed(() => {
  return userInfo.value?.name;
});
const loginLoading = ref(false);
// login
const handleLogin = async () => {
  isShowDialog.value = true;
};

const newsRef = ref(null);
const newClick = () => {
  if (newsRef.value) {
    console.log("🌈----------newClick ");
  }
};
</script>

<template>
  <div
    :class="isDark ? 'header-dark' : 'header-normal'"
    class="h-[55px] w-full flex items-center box-border px-[40px] z-999"
  >
    <div v-motion-roll-bottom h-full font-bold text="2xl">
      <!-- Wow🌟! -->
      <img :src="ImgLogo" class="w-full h-full scale-300 ml-4" />
    </div>
    <div flex-1></div>
    <div class="flex h-full items-center gap-5">
      <div
        @click="toggleDark()"
        icon-btn
        dark:i-carbon-moon
        i-carbon-sun
        title="Change Theme"
      />
      <a
        icon-btn
        i-carbon-logo-github
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
    <div class="flex items-center ml-5 cursor-pointer" v-loading="loginLoading">
      <!-- 已登录 -->
      <template v-if="isLogin">
        <div class="flex items-center border-none">
          <el-dropdown trigger="hover" @visible-change="handleVisible">
            <!-- 头像 -->
            <div class="flex justify-start items-center border-none">
              <el-avatar
                :size="35"
                :src="userInfo.avatar"
                :alt="userInfo.name"
              />
              <span class="el-dropdown-link navbar-bg-hover select-none">
                <div
                  class="text-[1.1em] inline-block bg-black dark:bg-white"
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
</style>
