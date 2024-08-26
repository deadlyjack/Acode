import './about.scss';
import mustache from 'mustache';
import Page from 'components/page';
import _template from './about.hbs';
import helpers from 'utils/helpers';
import actionStack from 'lib/actionStack';

export default function AboutInclude() {
  const $page = Page(strings.about.capitalize());

  system.getWebviewInfo(
    (res) => render(res),
    () => render(),
  );

  actionStack.push({
    id: 'about',
    action: $page.hide,
  });

  $page.onhide = function () {
    actionStack.remove('about');
    helpers.hideAd();
  };

  app.append($page);
  helpers.showAd();

  function render(webview) {
    const $content = helpers.parseHTML(
      mustache.render(_template, {
        ...BuildInfo,
        webview,
      }),
    );

    $page.classList.add('about-us');
    $page.body = $content;
  }
}
