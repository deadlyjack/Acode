import "./style.scss";

/**@type {HTMLDivElement} */
export const sideButtonContainer = <div className="side-buttons"></div>;

export default function SideButtons({
	text,
	icon,
	onclick,
	backgroundColor,
	textColor,
}) {
	const $button = (
		<button
			className="side-button"
			onclick={onclick}
			style={{ backgroundColor, color: textColor }}
		>
			<spam className={`icon ${icon}`}></spam>
			<span>{text}</span>
		</button>
	);

	return {
		show() {
			sideButtonContainer.append($button);
		},
		hide() {
			$button.remove();
		},
	};
}
