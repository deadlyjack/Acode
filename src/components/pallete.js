import inputhints from './inputhints';

export default function pallete(getList, onselect, placeholder, onremove) {
  const $input = <input onkeydown={onkeydown} type='search' placeholder={placeholder} onfocusout={remove} enterKeyHint='go' />;
  const $mask = <div className='mask' onclick={remove} />;
  const $pallete = <div id="command-pallete">{$input}</div>;

  inputhints($input, generateHints, (value) => {
    onselect(value);
    remove();
  });

  window.restoreTheme(true);
  app.append($pallete, $mask);
  $input.focus();

  actionStack.push({
    id: 'command-pallete',
    action: remove,
  });

  function onkeydown(e) {
    if (e.key === 'Escape') {
      remove();
    }
  }

  async function generateHints(setHints) {
    setHints([{ text: strings['loading...'], value: '' }]);
    const list = getList();
    let data = list;
    if (list instanceof Promise) {
      data = await list;
    }
    setHints(data);
  }

  function remove() {
    actionStack.remove('command-pallete');
    window.restoreTheme();
    $pallete.remove();
    $mask.remove();
    if (typeof onremove === 'function') onremove();
  }
}