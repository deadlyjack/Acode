import toast from "./toast";

/**
 *
 * @param {string} id
 * @param {string|HTMLElement|(hide: ()=>void)=>HTMLElement} message
 * @returns
 */
export default function tutorial(id, message) {
	if (localStorage.getItem(id) === "true") return;
	localStorage.setItem(id, "true");

	if (typeof message === "function") {
		message = message(toast.hide);
	}

	toast(message, false, "#17c", "#fff");
}
