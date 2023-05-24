import fsOperation from 'fileSystem';
import Url from 'utils/Url';
import helpers from 'utils/helpers';

const filesTree = {};
const events = {
  'add-file': [],
  'remove-file': [],
};

export function initFileList() {
  editorManager.on('add-folder', onAddFolder);
  editorManager.on('remove-folder', onRemoveFolder);
}

/**
 * 
 * @param {string|()=>object} dir 
 * @returns {Tree[]}
 */
export default function files(dir) {
  let transform;
  if (typeof dir === 'string') {
    return Object.values(filesTree).find((item) => getFile(dir, item));
  } else if (typeof dir === 'function') {
    transform = dir;
  }

  const allFiles = [];
  Object.values(filesTree).forEach((item) => {
    allFiles.push(...flattenTree(item, transform));
  });
  return allFiles;
}

/**
 * Adds event listener for file list
 * @param {'add-file'|'remove-file'} event - Event name 
 * @param {(tree:Tree)=>void} callback - Callback function
 */
files.on = function (event, callback) {
  if (!events[event]) events[event] = [];
  events[event].push(callback);
};

/**
 * Removes event listener for file list
 * @param {'add-file'|'remove-file'} event - Event name 
 * @param {(tree:Tree)=>void} callback - Callback function
 */
files.off = function (event, callback) {
  if (!events[event]) return;
  events[event] = events[event].filter((cb) => cb !== callback);
};

/**
 * Get all files in a folder
 * e.g /dir1/dir2/dir3
 * This function will first test if dir1 exists in the tree,
 * if not, it will return null, otherwise it will traverse the tree
 * and return the files in dir3
 * @param {string} path - Folder path
 * @param {Tree} tree - Files tree
 */
function getFile(path, tree) {
  const { children } = tree;
  let { url } = tree;
  if (path.endsWith('/')) path = path.slice(0, -1);
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (url === path) return tree;
  if (!children) return null;
  const len = children.length;
  for (let i = 0; i < len; i++) {
    const item = children[i];
    const result = getFile(path, item);
    if (result) return result;
  }
  return null;
}

/**
 * Get all files
 * @param {Tree} tree 
 * @param {(item:Tree)=>object} transform
 */
function flattenTree(tree, transform = (item) => item) {
  const list = [];
  const { children } = tree;
  if (!children) {
    return [transform(tree)];
  };
  children.forEach((item) => {
    if (item.children) list.push(...flattenTree(item, transform));
    else list.push(transform(item));
  });
  return list;
}

/**
 * Called when a folder is added
 * @param {string} folder - Folder path
 */
async function onAddFolder(folder) {
  try {
    const { name } = await fsOperation(folder).stat();
    const path = helpers.getVirtualPath(folder);
    const tree = { name, url: folder, path };
    tree.children = [];
    getAllFiles(tree.children, folder);
    filesTree[folder] = tree;
  } catch (error) {
    // ignore
  }
}

/**
 * Called when a folder is removed
 * @param {string} folder - Folder path 
 */
function onRemoveFolder(folder) {
  const tree = filesTree[folder];
  if (!tree) return;
  delete filesTree[folder];
  const files = flattenTree(tree);
  files.forEach((file) => {
    emit('remove-file', file);
  });
}

/**
 * Get all file recursively
 * @param {Array} list - An array to store files
 * @param {string} dir - Directory path
 * @param {string} [root] - Root path
 */
async function getAllFiles(list, dir, root) {
  const ls = await fsOperation(dir).lsDir();
  ls.forEach((item) => {
    const { name, url, isDirectory } = item;
    const path = virtualPath(root ?? dir, url);
    const exists = list.findIndex(({ value }) => value === url);
    if (exists > -1) {
      return;
    }
    const relativeUrl = Url.join(path, name);
    const file = { name, path, url, relativeUrl };
    list.push(file);
    if (isDirectory) {
      file.children = [];
      getAllFiles(file.children, url, root ?? dir);
      return;
    }
    emit('push-file', file);
  });
}

/**
 * Get virtual path of a file
 * e.g content://storage/emulated/dir1/dir2/dir3 -> Storage/dir3
 * where content://storage/emulated/dir1/dir2 is added as a virtual path
 * with the name Storage
 * @param {string} root - Root path 
 * @param {string} url - File url
 */
function virtualPath(root, url) {
  const vRoot = helpers.getVirtualPath(root);
  if (root === url || !url) return vRoot;
  const vRootDir = Url.dirname(vRoot);
  const vUrl = helpers.getVirtualPath(url);
  return Url.dirname(vUrl.subtract(vRootDir)).replace(/\/$/, '');
}

/**
 * Emit an event
 * @param {string} event 
 * @param  {...any} args 
 */
function emit(event, ...args) {
  const list = events[event];
  if (!list) return;
  list.forEach((fn) => fn(...args));
}

/**
 * @typedef {Object} Tree
 * @property {string} name - File name
 * @property {string} path - Visible path
 * @property {string} url - File url
 * @property {string} relativeUrl - File relative url
 * @property {Array<Tree>} [children] - Children files
 */
