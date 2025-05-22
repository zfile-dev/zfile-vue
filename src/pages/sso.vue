<script setup>
import { useRouter } from "vue-router";

// 获取 url 中的 token 参数
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
	window.localStorage.setItem("zfile-token", token);
}

let router = useRouter();
router.push('/')
</script>