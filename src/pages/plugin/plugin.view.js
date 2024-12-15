import toast from "components/toast";
import alert from "dialogs/alert";
import fsOperation from "fileSystem";
import Ref from "html-tag-js/ref";
import actionStack from "lib/actionStack";
import constants from "lib/constants";
import Url from "utils/Url";

export default (props) => {
	const {
		id,
		name,
		body,
		icon,
		author,
		downloads,
		votes_up: votesUp,
		votes_down: votesDown,
		author_verified: authorVerified,
		author_github: authorGithub,
		comment_count: commentCount,
	} = props;

	let rating = "unrated";
	let moreInfoStyle = {};

	if (votesUp === undefined) {
		moreInfoStyle.display = "none";
	}

	if (votesUp || votesDown) {
		rating = `${Math.round((votesUp / (votesUp + votesDown)) * 100)}%`;
	}

	return (
		<div className="main" id="plugin">
			<div className="header">
				<div className="info">
					<span
						className="logo"
						style={{ backgroundImage: `url(${icon})` }}
					></span>
					<div className="desc">
						<span className="name">{name}</span>
						<div className="version">
							<Version {...props} />
						</div>
						<div className="author">
							<a href={`https://github.com/${authorGithub}`}>{author}</a>
							{authorVerified ? (
								<span
									on:click={() => {
										toast(strings["verified publisher"]);
									}}
									className="icon verified"
								></span>
							) : (
								""
							)}
						</div>
					</div>
				</div>
				<div style={moreInfoStyle} className="more-info">
					<div className="icon-info" data-label="downloads">
						<div>
							{downloads?.toLocaleString()}{" "}
							<span className="icon file_downloadget_app"></span>
						</div>
					</div>
					<div className="icon-info" data-label="ratings">
						<span style={{ margin: "auto" }}>{rating}</span>
					</div>
					<div
						onclick={showReviews.bind(null, id, author)}
						className="icon-info"
						data-label="reviews"
					>
						<div>
							{commentCount}&nbsp;<span className="icon chat_bubble"></span>
						</div>
					</div>
				</div>
				<div className="button-container primary">
					<Buttons {...props} />
				</div>
				<MoreInfo {...props} />
			</div>
			<div className="body md" innerHTML={body}></div>
		</div>
	);
};

function Buttons({
	name,
	isPaid,
	installed,
	update,
	install,
	uninstall,
	purchased,
	price,
	buy,
	minVersionCode,
}) {
	if (
		typeof minVersionCode === "number" &&
		minVersionCode > BuildInfo.versionCode
	) {
		return (
			<div className="error">
				<span className="icon info"></span>
				<a href={constants.PLAY_STORE_URL} className="text">
					{strings["plugin min version"]
						.replace("{name}", name)
						.replace("{v-code}", minVersionCode)}
				</a>
			</div>
		);
	}

	if (installed && update) {
		return (
			<>
				<button data-type="uninstall" onclick={uninstall}>
					{strings.uninstall}
				</button>
				<button data-type="update" onclick={install}>
					{strings.update}
				</button>
			</>
		);
	}

	if (installed) {
		return (
			<button data-type="uninstall" onclick={uninstall}>
				{strings.uninstall}
			</button>
		);
	}

	if (isPaid && !purchased && price) {
		return (
			<button data-type="buy" onclick={buy}>
				{price}
			</button>
		);
	}

	if (isPaid && !purchased && !price) {
		return (
			<div style={{ margin: "auto" }} className="flex-center">
				<span
					onclick={() => alert(strings.info, strings["no-product-info"])}
					className="icon info"
				></span>
				<span>{strings["product not available"]}</span>
			</div>
		);
	}

	return (
		<button data-type="install" onclick={install}>
			{strings.install}
		</button>
	);
}

function Version({ currentVersion, version }) {
	if (!currentVersion) return <span>v{version}</span>;
	return (
		<span>
			v{currentVersion}&nbsp;&#8594;&nbsp;v{version}
		</span>
	);
}

async function showReviews(pluginId, author) {
	const mask = new Ref();
	const body = new Ref();
	const container = new Ref();

	actionStack.push({
		id: "reviews",
		action: closeReviews,
	});

	app.append(
		<span
			style={{ zIndex: 998 }}
			ref={mask}
			onclick={closeReviews}
			className="mask"
		></span>,
	);
	app.append(
		<div ref={container} className="reviews-container">
			<div className="reviews-header" ontouchstart={ontouchstart}></div>
			<div className="write-review">
				<a
					style={{ textDecoration: "none", display: "flex" }}
					href={Url.join(constants.API_BASE, `../plugin/${pluginId}/comments`)}
				>
					<span className="icon edit"></span>
					<span className="title">Review</span>
				</a>
			</div>
			<div ref={body} className="reviews-body loading"></div>
		</div>,
	);

	try {
		const reviews = await fsOperation(
			constants.API_BASE,
			`/comments/${pluginId}`,
		).readFile("json");
		if (!reviews.length) {
			body.style.textAlign = "center";
			body.textContent = "No reviews yet";
			return;
		}

		reviews.forEach((review) => {
			if (!review.comment) return;
			review.author = author;
			body.append(<Review {...review} />);
		});
	} catch (error) {
		body.textContent = error.message;
	} finally {
		body.classList.remove("loading");
	}

	function closeReviews() {
		actionStack.remove("reviews");
		container.classList.add("hide");

		setTimeout(() => {
			mask.el.remove();
			container.el.remove();
		}, 300);
	}

	/**
	 * @param {TouchEvent} e
	 */
	function ontouchstart(e) {
		const { clientY } = e.touches[0];
		const { top } = container.el.getBoundingClientRect();
		const y = clientY - top;
		let dy = 0;

		container.style.transition = "none";
		document.addEventListener("touchmove", ontouchmove);
		document.addEventListener("touchend", ontouchend);
		document.addEventListener("touchcancel", ontouchend);

		function ontouchmove(e) {
			const { clientY } = e.touches[0];
			dy = clientY - top - y;

			if (dy < 0) dy = 0;

			container.style.transform = `translateY(${dy}px)`;
		}

		function ontouchend() {
			document.removeEventListener("touchmove", ontouchmove);
			document.removeEventListener("touchend", ontouchend);
			document.removeEventListener("touchcancel", ontouchcancel);
			if (dy < 100) {
				container.style.transition = "transform 0.3s ease-in-out";
				container.style.transform = "translateY(0)";
				return;
			}
			closeReviews();
		}
	}
}

function Review({
	name,
	github,
	vote,
	comment,
	author,
	author_reply: authorReply,
}) {
	let dp = Url.join(constants.API_BASE, `../user.png`);
	let voteImage = new Ref();
	let review = new Ref();

	if (github) {
		dp = `https://avatars.githubusercontent.com/${github}`;
	}

	if (vote === 1) {
		voteImage.style.backgroundImage = `url(${Url.join(constants.API_BASE, `../thumbs-up.gif`)})`;
	} else if (vote === -1) {
		voteImage.style.backgroundImage = `url(${Url.join(constants.API_BASE, `../thumbs-down.gif`)})`;
	}

	if (authorReply) {
		setTimeout(() => {
			review.append(
				<p className="author-reply" data-author={author}>
					{authorReply}
				</p>,
			);
		}, 0);
	}

	return (
		<div ref={review} className="review">
			<div title={name} className="review-author">
				<span
					style={{ backgroundImage: `url(${dp})` }}
					className="user-profile"
				></span>
				<span className="user-name">{name}</span>
				<span ref={voteImage} className="vote"></span>
			</div>
			<p className="review-body">{comment}</p>
		</div>
	);
}

function MoreInfo({ purchased, price, refund }) {
	if (!purchased) return "";

	return (
		<small className="more-info-small">
			<span>{strings.owned}</span> • <span>{price}</span> •{" "}
			<span className="link" onclick={refund}>
				{strings.refund}
			</span>
		</small>
	);
}
