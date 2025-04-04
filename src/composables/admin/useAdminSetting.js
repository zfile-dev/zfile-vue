import { loadConfigReq } from "~/api/admin/admin-setting";
import { useRequest } from "vue-request";

export default function useAdminSetting(saveReq, formRef) {

	const siteSetting = ref(null);

	// 加载请求
	const {
		loading: siteSettingLoading,
		refresh: siteSettingReload
	} = useRequest(loadConfigReq, {
		cacheKey: "siteSetting",
		onSuccess(res) {
			siteSetting.value = res.data;
		}
	});

	// 保存请求
	const {
		loading: saveLoading,
		run: saveSetting
	} = useRequest(saveReq, {
		manual: true,
		onSuccess() {
			ElMessage({
				message: "保存成功",
				type: "success"
			});
		}
	});

	const saveData = (alertMsg) => {
		if (formRef && formRef.value) {
			formRef.value.validate((errors, fields) => {
				if (errors) {
					saveSetting(siteSetting.value);
				} else if (alertMsg === true) {
					for (let key in fields) {
						let msg = '';
						for (let i = 0; i < fields[key].length; i++) {
							msg += fields[key][i].message;
							if (i < fields[key].length - 1) {
								msg += ', ';
							}
						}
						ElMessage.warning(msg);
					}
				}
			});
		} else {
			saveSetting(siteSetting.value);
		}
	};

	return {
		siteSetting, siteSettingLoading, siteSettingReload,
		saveData, saveLoading
	};
}
