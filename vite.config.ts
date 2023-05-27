import { resolve } from 'path'
import Tov from './presets/tov'
import { defineConfig } from 'vite'

export default defineConfig({
	resolve: {
		alias: {
			'~/': `${resolve(__dirname, 'src')}/`,
		},
	},
	build: {
		target: ['es2015'],
		cssTarget: ['chrome49']
	},
	define: {
		'process.env': {}
	},
	server:{
		host: '0.0.0.0',
	},
	plugins: [Tov()],
})