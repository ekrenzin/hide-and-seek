import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.hideandseek.app',
	appName: 'hide-and-seek',
	webDir: 'build',
	server: {
		androidScheme: 'https'
	},
	bundledWebRuntime: false
};

export default config;
