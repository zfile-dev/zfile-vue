import { ElMessage } from "element-plus";
import { baseSsoConfig } from "~/composables/admin/sso/baseSsoConfig";
import {
	listReq,
	deleteReq,
	saveOrUpdateReq,
	checkProviderDuplicateReq,
} from "~/api/admin/admin-sso";

const currentSsoProvider = ref()

export default function useSsoConfig() {

	const ssoConfigList = ref([])
	const autoId = ref(-1)

	onMounted(() => {
		loadList()
	})

	const loadList = () => {
		listReq().then((res) => {
			ssoConfigList.value = res.data.map(item => {
				return {
					...item,
				}
			})
			if (!currentSsoProvider.value) {
				currentSsoProvider.value = ssoConfigList.value[0]?.id
			}
		})
	}

	const saveOrUpdate = () => {
		const item = ssoConfigList.value.find(item => item.id === currentSsoProvider.value)
		if (item.id < 0) {
			item.id = null
		}
		saveOrUpdateReq(item).then((res) => {
			ElMessage({
				type: 'success',
				message: '保存成功',
			})
			if (!item.id) {
				currentSsoProvider.value = res.data.id
			}
			loadList()
		})
	}

	const formRules = ref({
		provider: [
			{ required: true, message: '请输入服务商简称', trigger: ['change'] },
			{
				validator: (rule, value, callback) => {
					let reg = /^[a-z0-9_-]+$/;
					if (!reg.test(value)) {
						callback(new Error('只允许使用小写字母、数字、下划线、横杠。'));
						return
					}

					let params = {
						id: currentSsoProvider.value,
						provider: value
					};

					checkProviderDuplicateReq(params).then((res) => {
						if (res.data) {
							callback(new Error("该服务商简称已存在，请修改。"));
						} else {
							callback();
						}
					});
				}
			},
		],
		name: [
			{required: true, message: '请输入服务商名称', trigger: ['change']},
		],
		icon: [
			{required: true, message: '请输入服务商图标', trigger: ['change']},
		],
		clientId: [
			{required: true, message: '请输入 ClientId', trigger: ['change']},
		],
		clientSecret: [
			{required: true, message: '请输入 ClientSecret', trigger: ['change']},
		],
		authUrl: [
			{required: true, message: '请输入授权端点', trigger: ['change']},
		],
		tokenUrl: [
			{required: true, message: '请输入 Token 端点', trigger: ['change']},
		],
		userInfoUrl: [
			{required: true, message: '请输入用户信息端点', trigger: ['change']},
		],
		scope: [
			{required: true, message: '请输入授权范围', trigger: ['change']},
		],
		bindingField: [
			{required: true, message: '请输入绑定字段', trigger: ['change']},
		],
		enabled: [
			{required: true, message: '请选择是否启用', trigger: ['change']},
		],
	});

	const addTab = (provider) => {
		const index = autoId.value--;
		if (provider) {
			const providerConfig = baseSsoConfig[provider]
			if (providerConfig) {
				let newProvider = JSON.parse(JSON.stringify(providerConfig))
				newProvider.id = index
				ssoConfigList.value.push(newProvider)
				currentSsoProvider.value = index
				return;
			}
		}

		ssoConfigList.value.push({
			id: index,
			provider: 'new' + index,
			name: '新服务商' + index,
			icon: '',
			clientId: '',
			clientSecret: '',
			authUrl: '',
			tokenUrl: '',
			userInfoUrl: '',
			scope: '',
			bindingField: '',
			enabled: true,
		})
		currentSsoProvider.value = index
	}

	const removeTab = (delId) => {
		ElMessageBox.confirm('是否确认删除?', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			if (delId < 0) {
				const index = ssoConfigList.value.findIndex(item => item.id === delId)
				if (index === -1) {
					return
				}
				ssoConfigList.value.splice(index, 1)
				if (currentSsoProvider.value === delId) {
					currentSsoProvider.value = ssoConfigList.value[0]?.id
				}
			} else {
				deleteReq(delId).then((res) => {
					ElMessage({
						type: 'success',
						message: '删除成功',
					})

					if (currentSsoProvider.value === delId) {
						currentSsoProvider.value = null
					}
					loadList()
				})
			}
		})
	}

	return {
		ssoConfigList, currentSsoProvider,
		formRules, addTab, removeTab,
		saveOrUpdate
	}

}