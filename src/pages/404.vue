<script setup lang="ts">
import { init } from "ityped";

const contentRef = ref<null | Element>(null);

const code = ref<string>("404");

onMounted(() => {
	let params = new URLSearchParams(window.location.search);
	let message = params.get("message") || "没有数据的荒野!";
	code.value = params.get("code") || "404";

	init(contentRef.value as Element, {
		showCursor: false,
		disableBackTyping: true,
		strings: [message]
	});
});


const router = useRouter();

const back = () => router.push("/");
</script>

<template>
	<div class="error-body">
		<div class="error-desc">
			<div ref="codeRef" class="err-code">{{ code }}</div>
			<div ref="contentRef" class="err-content"></div>
			<button class="error-btn" @click="back">
				👉 返回首页
			</button>
		</div>

		<img src="../assets/icons/404.svg" class="err-cover" alt="page not found" />
	</div>
</template>

<style scoped>
</style>

<route lang="yaml">
meta:
  layout: notFound
</route>
