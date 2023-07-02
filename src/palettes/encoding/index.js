import palette from 'components/palette';
import encodings from 'lib/encodings';
import fsOperation from 'fileSystem';

export default function encodingPalette() {
  palette(generateHints, onselect, strings.encoding);
}

function generateHints() {
  return Object.keys(encodings).map(id => {
    const encoding = encodings[id];
    const aliases = encoding.aliases.join(', ');
    return {
      value: id,
      text: `<span>${encoding.label}</span><small>${id}</small><span hidden>${aliases}</span>`
    };
  });
}

async function onselect(encoding) {
  if (!encoding) return;

  const file = editorManager.activeFile;
  const text = await fsOperation(file.uri).readFile(encoding);

  file.encoding = encoding;
  file.session.setValue(text);
  file.markChanged = false;

  editorManager.onupdate('encoding');
  editorManager.emit('update', 'encoding');
}
