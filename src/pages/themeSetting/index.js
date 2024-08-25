export default function themeSetting(...args) {
	import(/* webpackChunkName: "themeSetting" */ "./themeSetting").then(
		(module) => {
			module.default(...args);
		},
	);
}
