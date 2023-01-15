export default ({ plugins }) => plugins.map((plugin) => <Plugin {...plugin} />);


/**
 * 
 * @param {object} param0
 * @param {string} [param0.id]
 * @param {string} [param0.name]
 * @param {string} [param0.icon]
 * @param {string} [param0.version]
 * @param {number} [param0.downloads]
 * @param {boolean} [param0.installed]
 * @returns 
 */
function Plugin({ id, name, icon, version, downloads, installed }) {
  return <div data-id={id} className='list-item' data-action='open' data-installed={(!!installed).toString()}>
    <span className='icon' style={{ backgroundImage: `url(${icon || './res/puzzle.png'})` }}></span>
    <div className='container'>
      <div className='text' style={{ justifyContent: 'space-between' }}>{name}</div>
      <small className='value'>
        <div className='group'>
          <div className='text'>v{version}</div>
        </div>
        {
          downloads
            ? <div className='group'>
              <div className='text'>{downloads.toLocaleString()}</div>
              <div style={{ width: 'fit-content' }} className='icon file_downloadget_app'></div>
            </div>
            : <></>
        }
      </small>
    </div>
  </div>
}
