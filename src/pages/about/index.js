//jshint ignore:start

function About() {
	import(/* webpackChunkName: "about" */ "./about").then((res) => {
		res.default();
	});
}
export default About;
