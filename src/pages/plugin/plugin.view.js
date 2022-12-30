export default (props) => <div className="main" id="plugin">
  <div className="header">
    <div className="info">
      <span className="logo" style={{ backgroundImage: `url(${props.icon})` }}></span>
      <div className="desc">
        <span className="name">{props.name}</span>
        <DownloadCounter {...props} />
        <a className="author" href={`https://github.com/${props.author_github}`}>{props.author}</a>
      </div>
    </div>
    <div className="button-container primary">
      <Buttons {...props} />
    </div>
  </div>
  <div className="body md" innerHTML={props.body}></div>
</div>

function Buttons({ installed, update, install, uninstall }) {
  if (installed && update) {
    return <>
      <button onclick={uninstall}>{strings.uninstall}</button>
      <button onclick={install}>{strings.update}</button>
    </>
  }

  if (installed) {
    return <button onclick={uninstall}>{strings.uninstall}</button>
  }

  return <button onclick={install}>{strings.install}</button>
}

function Version({ currentVersion, version }) {
  if (!currentVersion) return <span>v{version}</span>
  return <span>v{currentVersion}&nbsp;&#8594;&nbsp;v{version}</span>;
}

function DownloadCounter({ downloads, currentVersion, version }) {
  const $el = <Version version={version} currentVersion={currentVersion} />;
  if (downloads) {
    return <div className="version">
      {$el}&nbsp;•&nbsp;{downloads}<span className='icon file_downloadget_app'></span>
    </div>;
  }

  return <div className="version">{$el}</div>;
}
