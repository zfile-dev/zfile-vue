import { resolve } from 'path'
import { env } from './shared/env'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ViteRestart from 'vite-plugin-restart'
import Layouts from 'vite-plugin-vue-meta-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import {FileSystemIconLoader} from "unplugin-icons/loaders";
import Components from 'unplugin-vue-components/vite'
import viteCompression from 'vite-plugin-compression'
import legacy from '@vitejs/plugin-legacy'
import VueDevTools from 'vite-plugin-vue-devtools'
import visualizer from "rollup-plugin-visualizer";
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path';
import {
	HeadlessUiResolver,
	ElementPlusResolver,
	VueUseComponentsResolver,
} from 'unplugin-vue-components/resolvers'
import Modules from 'vite-plugin-use-modules'
import { GenerateTitle } from './plugins/html'
import { AutoImportResolvers, normalizeResolvers } from './shared/resolvers'

export default () => {
	return [
		legacy({
			targets: ["defaults", "not IE 11", "chrome >= 49", "firefox >= 1", "edge > 1"],  //需要兼容的目标列表，可以设置多个
			additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
			modernPolyfills: ["es.global-this"],
			renderLegacyChunks: true
		}),
		// 模块自动加载
		Modules({
			auto: true
		}),
		// 生成 title
		GenerateTitle(),
		// vue 官方插件，用来解析 sfc
		Vue({
			include: [/\.vue$/, /\.md$/]
		}),
		// 文件路由
		Pages({
			extensions: ["vue", "md", "tsx"],
			exclude: ["**/pages/file.vue"]
			// extendRoute: route => {
			// 	if (route.path === '/:storageKey/:fullpath(.*)') {
			// 		route.path = '/:storageKey/:fullpath(.*)*'
			// 	}
			// }
		}),
		// 布局系统
		Layouts(),
		// https://icones.netlify.app/
		Icons({
			autoInstall: true,
			compiler: "vue3",
			customCollections: {
				// 这里是存放svg图标的文件地址，custom是自定义图标库的名称
				custom: FileSystemIconLoader("./src/assets/icons")
			}
		}),
		// 组件自动按需引入
		Components({
			extensions: ["vue", "md", "tsx"],
			include: [/\.md$/, /\.vue$/, /\.tsx$/],
			dts: resolve(__dirname, "./types/components.d.ts"),
			resolvers: normalizeResolvers({
				onlyExist: [
					[ElementPlusResolver({
						importStyle: "sass",
					}), "element-plus"],
					[HeadlessUiResolver(), "@headlessui/vue"],
					[VueUseComponentsResolver(), "@vueuse/components"]
				],
				include: [IconsResolver({
					customCollections: ["custom"]
				})]
			})
		}),
		// api 自动按需引入
		env.VITE_APP_API_AUTO_IMPORT &&
		AutoImport({
			dirs: [
				env.VITE_APP_API_AUTO_IMPORT && "src/stores/**",
				env.VITE_APP_API_AUTO_IMPORT && "src/composables/**",
				env.VITE_APP_API_AUTO_IMPORT && "src/constant/**",
				env.VITE_APP_API_AUTO_IMPORT && "src/components/**",
			],
			include: [/\.vue$/, /\.ts$/, /\.js$/],
			vueTemplate: true,
			dts: "./presets/types/auto-imports.d.ts",
			imports: ["vue", "pinia", "vue-router", "@vueuse/core"],
			resolvers: AutoImportResolvers,
			eslintrc: {
				enabled: true,
				globalsPropValue: true,
				filepath: "presets/eslint/.eslintrc-auto-import.json"
			}
		}),
		visualizer({
			open: true,
			gzipSize: true,
			brotliSize: true
		}),
		// 预设热重启服务
		ViteRestart({
			restart: [".env*", "presets/tov.[jt]s", "presets/shared/**/*"]
		}),
		// tsx 支持
		vueJsx(),
		// 生产环境资源压缩
		viteCompression({
			disable: true,
			// @ts-ignore
			algorithm: env.VITE_APP_COMPRESSINON_ALGORITHM
		}),
		createSvgIconsPlugin({
			// 指定需要缓存的图标文件夹
			iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
			// 指定symbolId格式
			symbolId: "icon-[dir]-[name]",
			// 自定义 dom id
			customDomId: "__svg__icons__dom__"
		}),
		env.VITE_APP_DEV_TOOLS && VueDevTools(),
	];
}