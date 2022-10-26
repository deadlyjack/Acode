export default (props) => <div className="main" id="plugin">
  <div className="header">
    <div className="info">
      <span className="logo" style={{ backgroundImage: `url(${props.icon})` }}></span>
      <div className="desc">
        <span className="name">{props.name}</span>
        <span className="version">{props.version} {props.update ? <span>&#8594; v{props.update}</span> : ''}</span>
        <span className="author" action="open">{props.author.name}</span>
        <div action="github" className="tag">
          <span>{props.type ? props.type : 'free'}</span>
        </div>
      </div>
    </div>
    <div className="button-container primary">
      <Buttons props={props} />
    </div>
  </div>
  <div className="body md" innerHTML={props.body}></div>
</div>

function Buttons({ props }) {
  if (props.installed && props.update) {
    return <>
      <button onclick={props.uninstall}>{strings.uninstall}</button>
      <button onclick={props.install}>{strings.update}</button>
    </>
  }

  if (props.installed) {
    return <button onclick={props.uninstall}>{strings.uninstall}</button>
  }

  if (props.isPaid) {
    return <button action="buy">{strings['download acode pro']}</button>
  }

  return <button onclick={props.install}>{strings.install}</button>
}
