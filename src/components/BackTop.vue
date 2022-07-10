<template>
	<el-backtop :bottom="50" target=".el-main">
		<el-tooltip placement="top" content="回到顶部">
			<transition name="fade">
				<el-icon>
					<CaretTop/>
				</el-icon>
			</transition>
		</el-tooltip>
	</el-backtop>
</template>

<script setup>
import {CaretTop} from "@element-plus/icons-vue";
</script>

<style scoped>

</style>