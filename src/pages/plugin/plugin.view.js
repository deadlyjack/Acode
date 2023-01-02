import Ref from 'html-tag-js/ref';
import api from '../../lib/api';
import constants from '../../lib/constants';
import Url from '../../utils/Url';

export default (props) => {
  const {
    id,
    name,
    downloads,
    body,
    votes_up: votesUp,
    votes_down: votesDown,
  } = props;

  let rating = 'unrated';

  if (votesUp || votesDown) {
    rating = `${Math.round(votesUp / (votesUp + votesDown) * 100)}%`;
  }

  return <div className="main" id="plugin">
    <div className="header">
      <div className="info">
        <span className="logo" style={{ backgroundImage: `url(${props.icon})` }}></span>
        <div className="desc">
          <span className="name">{name}</span>
          <div className='version'><Version {...props} /></div>
          <a className="author" href={`https://github.com/${props.author_github}`}>{props.author}</a>
        </div>
      </div>
      <div className='more-info'>
        <div className='icon-info' data-label='downloads'>
          <div>{downloads} <span className='icon file_downloadget_app'></span></div>
        </div>
        <div className='icon-info' data-label='ratings'>
          <span style={{ margin: 'auto' }}>{rating}</span>
        </div>
        <div onclick={showReviews.bind(null, id)} className='icon-info' data-label='reviews'>
          <span className='icon chat_bubble'></span>
        </div>
      </div>
      <div className="button-container primary">
        <Buttons {...props} />
      </div>
    </div>
    <div className="body md" innerHTML={body}></div>
  </div>;
}

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

async function showReviews(pluginId) {
  const mask = new Ref();
  const body = new Ref();
  const container = new Ref();

  actionStack.push({
    id: 'reviews',
    action: closeReviews,
  });

  app.append(<span style={{ zIndex: 998 }} ref={mask} onclick={closeReviews} className='mask'></span>);
  app.append(
    <div ref={container} className='reviews-container'>
      <div className='reviews-header'>
        <div>
          <span className='icon chat_bubble'></span>
          <span className='title'>Reviews</span>
        </div>
        <div>
          <a className='icon edit' href={Url.join(constants.API_BASE, `../plugin/${pluginId}`)}></a>
        </div>
      </div>
      <div ref={body} className='reviews-body'></div>
    </div>
  );

  try {
    const reviews = await api.get(`/comments/${pluginId}`);
    if (!reviews.length) {
      body.style.textAlign = 'center';
      body.textContent = 'No reviews yet';
      return;
    }

    reviews.forEach(review => {
      body.append(<Review {...review} />);
    });
  } catch (error) {
    body.textContent = error.message;
  }

  function closeReviews() {
    actionStack.remove('reviews');
    container.el.classList.add('hide');

    setTimeout(() => {
      mask.el.remove();
      container.el.remove();
    }, 300);
  }
}

function Review({ name, github, vote, comment }) {
  let dp = Url.join(constants.API_BASE, `../user.png`);
  let voteImage = new Ref();

  if (github) {
    dp = `https://avatars.githubusercontent.com/${github}`;
  }

  if (vote === 1) {
    voteImage.style.backgroundImage = `url(${Url.join(constants.API_BASE, `../thumbs-up.gif`)})`;
  } else if (vote === -1) {
    voteImage.style.backgroundImage = `url(${Url.join(constants.API_BASE, `../thumbs-down.gif`)})`;
  }

  return <div className='review'>
    <div title={name} className='review-author'>
      <span style={{ backgroundImage: `url(${dp})` }} className='user-profile'></span>
      <span>{name}</span>
      <span ref={voteImage} className='vote'></span>
    </div>
    <p className='review-body'>{comment}</p>
  </div>;
}

