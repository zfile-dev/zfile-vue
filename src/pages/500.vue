<script setup lang="ts">
import { init } from "ityped";

const contentRef = ref<null | Element>(null);

const code = ref<string>("500");

onMounted(() => {
	let params = new URLSearchParams(window.location.search);
	let message = params.get("message") || "访问异常!";
	code.value = params.get("code") || "500";

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

		<img src="../assets/icons/500.svg" class="err-cover" alt="server error" />
	</div>
</template>

<style scoped>
</style>

<route lang="yaml">
meta:
  layout: notFound
</route>
