import "./style.scss";

/**
 * @typedef {object} Tile
 * @property {String} text
 * @property {String} subText
 * @property {function(HTMLElement):void} lead
 * @property {function(HTMLElement):void} tail
 */

/**
 *
 * @param {object} [options]
 * @param {HTMLElement} [options.lead]
 * @param {HTMLElement} [options.tail]
 * @param {string | HTMLElement} [options.text]
 * @param {string} [options.subText]
 * @param {string} [options.type]
 * @returns {HTMLElement & Tile}
 */
function tile(options = {}) {
	const $el = tag(options.type || "li", {
		className: "tile",
	});

	const $titleEl =
		typeof options.text === "string"
			? tag("span", {
					textContent: options.text || "",
					className: "text",
				})
			: options.text;
	const leadEl =
		options.lead ||
		tag("span", {
			className: "lead",
		});
	const tailEl =
		options.tail ||
		tag("span", {
			className: "tail",
		});

	if (options.subText) {
		$titleEl.setAttribute("data-subtext", options.subText);
		$titleEl.classList.add("sub-text");
	}

	$el.append(leadEl, $titleEl, tailEl);

	Object.defineProperties($el, {
		text: {
			get() {
				return $titleEl.textContent;
			},
			set(text) {
				$titleEl.textContent = text;
			},
		},
		subText: {
			get() {
				return $titleEl.getAttribute("data-subtext");
			},
			set(text) {
				if (text) {
					$titleEl.setAttribute("data-subtext", text);
					$titleEl.classList.add("sub-text");
				} else {
					$titleEl.classList.remove("sub-text");
				}
			},
		},
		lead: {
			value($newLead) {
				$el.replaceChild($newLead, $el.firstChild);
			},
		},
		tail: {
			value($newTail) {
				$el.replaceChild($newTail, $el.lastChild);
			},
		},
	});

	return $el;
}

export default tile;
