import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.hideandseek.app',
	appName: 'hide-and-seek',
	webDir: 'build',
	server: {
		androidScheme: 'https'
	},
	plugins: {
		FirebaseAuthentication: {
			skipNativeAuth: false,
			providers: ['apple.com', 'facebook.com', 'google.com']
		}
	},

	bundledWebRuntime: false
};

export default config;
