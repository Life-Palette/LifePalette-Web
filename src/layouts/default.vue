<script setup>
import { StarportCarrier } from 'vue-starport'
</script>

<template>
	<div
		class="font-sans text-center text-gray-700 dark:text-gray-200 overscroll-auto flex flex-col h-screen w-full"
	>
		<div class="top-0 sticky z-[999]">
			<TheHeader />
		</div>
		<div class="con-h px-5 flex w-full box-border md:h-auto">
			<div class="hidden md:block">
				<Slider />
				<div class="flex-1" />
			</div>

			<StarportCarrier>
				<!-- <RouterView v-slot="{ Component }">
          <transition name="page-fade">
            <component :is="Component" />
          </transition>
        </RouterView> -->

				<router-view v-if="$route.meta.keepAlive" v-slot="{ Component }">
					<transition name="page-fade">
						<keep-alive>
							<component :is="Component" />
						</keep-alive>
					</transition>
				</router-view>

				<router-view v-if="!$route.meta.keepAlive" v-slot="{ Component }">
					<transition name="page-fade">
						<component :is="Component" />
					</transition>
				</router-view>
			</StarportCarrier>
		</div>
	</div>
</template>

<style lang="less" scoped>
// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}
.con-h {
  height: calc(100vh - 60px);
}
</style>
