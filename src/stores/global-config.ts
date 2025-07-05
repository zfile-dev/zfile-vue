import { defineStore } from "pinia";
// @ts-ignore
import { isMobile } from "../utils";
import { FormProps } from "element-plus/es/components/form/src/form";

// 全局配置信息, 初始化自 /public/zfile.config.json 文件中.
const useGlobalConfigStore = defineStore("globalConfigStore", {
	state: () => {
		return {
			zfileConfig: {
				baseUrl: "",
				router: {
					mode: "history"
				},
				skeleton: {
					enable: true,
					show: "always",
					size: 20
				},
				gallery: {
					mobileColumn: 5,
					column: 3,
					columnSpacing: 50,
					rowSpacing: 10,
					showInfo: true,
					showInfoMode: "hover",
					roundedBorder: true,
					showBackTop: true
				},
				imagePreview: {
					mode: "full",
					gallery: true
				},
				officePreview: {},
				admin: {
					form: {
						mobile: {
							"size": "mini",
							"labelWidth": "120px",
							"labelPosition": "left",
						},
						pc: {
							"size": "mini",
							"labelWidth": "120px",
							"labelPosition": "left",
						}
					},
					search: {
						mobile: {
							size: "mini",
							spanSize: 16,
						},
						pc: {
							size: "mini",
							spanSize: 8,
						}
					},
					table: {
						mobile: {
							"size": "default",
							"pager": {
								"size": "small",
								"background": true,
								"layout": "prev, pager, next",
								"pagerCount": 5
							}
						},
						pc: {
							"size": "default",
							"pager": {
								"size": "default",
								"background": true,
								"layout": "total, sizes, prev, pager, next, jumper",
								"pagerCount": 5
							}
						}
					}
				}
			}
		};
	},
	actions: {
		updateZfileConfig(val: any) {
			this.zfileConfig = val;
		}
	},
	getters: {
		serverAddress(): string {
			return this.zfileConfig.baseUrl || window.location.origin;
		},
		frontAddress() {
			return window.location.origin;
		},
		adminForm(): FormProps {
			return isMobile.value ?
				this.zfileConfig.admin.form.mobile as FormProps
				:
				this.zfileConfig.admin.form.pc as FormProps;
		},
		adminSearch(): any {
			return isMobile.value ?
				this.zfileConfig.admin.search.mobile
				:
				this.zfileConfig.admin.search.pc;
		},
		adminTable(): any {
			return isMobile.value ?
				this.zfileConfig.admin.table.mobile
				:
				this.zfileConfig.admin.table.pc;
		}
	}
});

export default useGlobalConfigStore;
