import loader from "dialogs/loader";
import fsOperation from "fileSystem";
import purchaseListener from "handlers/purchase";
import JSZip from "jszip";
import Url from "utils/Url";
import helpers from "utils/helpers";
import constants from "./constants";
import loadPlugin from "./loadPlugin";

/**
 * Installs a plugin.
 * @param {string} id
 * @param {string} name
 * @param {string} purchaseToken
 * @param {(message: any) => void} setMessage
 */
export default async function installPlugin(
	id,
	name,
	purchaseToken,
	setMessage,
) {
	const title = name || "Plugin";
	const loaderDialog = loader.create(title, strings.installing);
	let pluginDir;
	let pluginUrl;

	try {
		if (!(await fsOperation(PLUGIN_DIR).exists())) {
			await fsOperation(DATA_STORAGE).createDirectory("plugins");
		}
	} catch (error) {
		window.log("error", error);
	}

	if (!/^(https?|file|content):/.test(id)) {
		pluginUrl = Url.join(
			constants.API_BASE,
			"plugin/download/",
			`${id}?device=${device.uuid}`,
		);
		if (purchaseToken) pluginUrl += `&token=${purchaseToken}`;
		pluginUrl += `&package=${BuildInfo.packageName}`;
		pluginUrl += `&version=${device.version}`;

		pluginDir = Url.join(PLUGIN_DIR, id);
	} else {
		pluginUrl = id;
	}

	try {
		if (!setMessage) loaderDialog.show();

		const plugin = await fsOperation(pluginUrl).readFile(
			undefined,
			(loaded, total) => {
				loaderDialog.setMessage(
					`${strings.loading} ${((loaded / total) * 100).toFixed(2)}%`,
				);
			},
		);

		if (plugin) {
			const zip = new JSZip();
			await zip.loadAsync(plugin);

			if (!zip.files["plugin.json"] || !zip.files["main.js"]) {
				throw new Error(strings["invalid plugin"]);
			}

			const pluginJson = JSON.parse(
				await zip.files["plugin.json"].async("text"),
			);

			if (pluginJson.dependencies) {
				for (const dependency of pluginJson.dependencies) {
					const _setMessage = setMessage ? setMessage : loaderDialog.setMessage;
					const hasError = await resolveDependency(dependency, _setMessage);
					if (hasError) throw new Error(strings.failed);
				}
			}

			if (!pluginDir) {
				pluginJson.source = pluginUrl;
				id = pluginJson.id;
				pluginDir = Url.join(PLUGIN_DIR, id);
			}

			if (!(await fsOperation(pluginDir).exists())) {
				await fsOperation(PLUGIN_DIR).createDirectory(id);
			}

			const promises = Object.keys(zip.files).map(async (file) => {
				let correctFile = file;
				if (/\\/.test(correctFile)) {
					correctFile = correctFile.replace(/\\/g, "/");
				}

				const fileUrl = Url.join(pluginDir, correctFile);
				if (!(await fsOperation(fileUrl).exists())) {
					await createFileRecursive(pluginDir, correctFile);
				}

				if (correctFile.endsWith("/")) return;

				let data = await zip.files[file].async("ArrayBuffer");

				if (file === "plugin.json") {
					data = JSON.stringify(pluginJson);
				}

				await fsOperation(fileUrl).writeFile(data);
			});

			await Promise.all(promises);
			await loadPlugin(id, true);
		}
	} catch (err) {
		try {
			await fsOperation(pluginDir).delete();
		} catch (error) {
			// ignore
		}
		throw err;
	} finally {
		if (!setMessage) loaderDialog.destroy();
	}
}

/**
 * Create directory recursively
 * @param {string} parent
 * @param {Array<string> | string} dir
 */
async function createFileRecursive(parent, dir) {
	let isDir = false;
	if (typeof dir === "string") {
		if (dir.endsWith("/")) {
			isDir = true;
			dir = dir.slice(0, -1);
		}
		dir = dir.split("/");
	}
	dir = dir.filter((d) => d);
	const cd = dir.shift();
	const newParent = Url.join(parent, cd);
	if (!(await fsOperation(newParent).exists())) {
		if (dir.length || isDir) {
			await fsOperation(parent).createDirectory(cd);
		} else {
			await fsOperation(parent).createFile(cd);
		}
	}
	if (dir.length) {
		await createFileRecursive(newParent, dir);
	}
}

/** Resolve dependency
 * @param {string} id
 * @param {(message: any) => void} setMessage
 * @returns {Promise<boolean>} has error
 */
async function resolveDependency(id, setMessage) {
	let purchaseToken;
	let product;
	let isPaid = false;

	try {
		const remoteDependency = await fsOperation(
			constants.API_BASE,
			`plugin/${id}`,
		)
			.readFile("json")
			.catch(() => null);

		if (!remoteDependency) return true;

		const version = await isInstalled(id);
		if (remoteDependency?.version === version) return false;

		plugin = Object.assign({}, remoteDependency);

		if (!Number.parseFloat(remoteDependency.price)) return true;

		isPaid = remoteDependency.price > 0;
		[product] = await helpers.promisify(iap.getProducts, [
			remoteDependency.sku,
		]);
		if (product) {
			const purchase = await getPurchase(product.productId);
			purchaseToken = purchase?.purchaseToken;
		}

		if (isPaid && !purchaseToken) {
			if (!product) throw new Error("Product not found");
			const apiStatus = await helpers.checkAPIStatus();

			if (!apiStatus) {
				alert(strings.error, strings.api_error);
				return true;
			}

			iap.setPurchaseUpdatedListener(...purchaseListener(onpurchase, onerror));
			setMessage(strings["loading..."]);
			await helpers.promisify(iap.purchase, product.json);

			async function onpurchase(e) {
				const purchase = await getPurchase(product.productId);
				await ajax.post(Url.join(constants.API_BASE, "plugin/order"), {
					data: {
						id: id,
						token: purchase?.purchaseToken,
						package: BuildInfo.packageName,
					},
				});
				purchaseToken = purchase?.purchaseToken;
			}

			async function onerror(error) {
				helpers.error(error);
				return true;
			}
		}

		setMessage(
			`${strings.installing.replace("...", "")} ${remoteDependency.name}...`,
		);
		await installPlugin(dependency, undefined, purchaseToken, setMessage);
	} catch (error) {
		helpers.error(error);
	}

	async function getPurchase(sku) {
		const purchases = await helpers.promisify(iap.getPurchases);
		const purchase = purchases.find((p) => p.productIds.includes(sku));
		return purchase;
	}

	/**
	 *
	 * @param {string} id
	 * @returns {Promise<string>} plugin version
	 */
	async function isInstalled(id) {
		if (await fsOperation(PLUGIN_DIR, id).exists()) {
			const plugin = await fsOperation(PLUGIN_DIR, id, "plugin.json").readFile(
				"json",
			);
			return plugin.version;
		}
	}
}
