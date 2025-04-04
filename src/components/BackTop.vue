<template>
	<el-backtop :bottom="50" target=".el-main">
		<el-tooltip placement="top" content="回到顶部">
			<transition name="fade">
        <ArrowUpIcon class="w-5" />
			</transition>
		</el-tooltip>
	</el-backtop>
</template>

<script setup>
import { ArrowUpIcon } from '@heroicons/vue/24/outline'

</script>

<style scoped>

</style>
