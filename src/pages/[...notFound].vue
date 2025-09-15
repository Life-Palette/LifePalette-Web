<script setup lang="ts">
const typedRef = useTyped([' is not found!'])
</script>

<template>
  <div class="text-center flex flex-wrap h-screen items-center justify-around">
    <div class="desc font-blod">
      <div class="code text-7xl">
        404
      </div>
      <div ref="typedRef" class="content text-3xl mb-5">
        The Page
      </div>
      <RouterLink :to="safeResolve('/')">
        <button
          class="text-lg px-5 py-2 rounded bg-light-800 transition hover:shadow-md dark:text-black"
        >
          Go Home
        </button>
      </RouterLink>
    </div>
    <img
      :src="safeResolve('/notFound/32.svg')"
      class="cover"
      alt="page not found"
    >
  </div>
</template>

<style>
.code {
  margin-bottom: 20px;
}

.content {
  height: 40px;
}

.cover {
  height: auto;
  width: 700px;
  margin: 0 5px;
  max-width: 100%;
  max-height: 100%;
}

.desc {
  flex: 1;
  width: 300px;
}
</style>

<route lang="json">
{
	"meta": {
		"title": "404",
		"layout": "notFound"
	}
}
</route>
