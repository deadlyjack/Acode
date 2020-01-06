import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from "../../components/page";
import _template from './about.hbs';
import './about.scss';

export default function aboutUs() {
    const $page = Page(strings.about);
    const $content = tag.parse(mustache.render(_template, BuildInfo));
    actionStack.push({
        id: 'about',
        action: $page.hide
    });
    $page.onhide = function () {
        actionStack.remove('about');
    };

    $page.classList.add('about-us');

    $page.append($content);

    document.body.append($page);
}