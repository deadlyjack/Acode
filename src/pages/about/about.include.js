import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from "../../components/page";
import _template from './about.hbs';
import './about.scss';
import rateBox from '../../components/rateBox';

export default function AboutInclude() {
    const $page = Page(strings.about);
    const $content = tag.parse(mustache.render(_template, BuildInfo));
    actionStack.push({
        id: 'about',
        action: $page.hide
    });

    $content.onclick = e => {
        const $el = e.target;
        if (!($el instanceof HTMLElement)) return;
        const action = $el.getAttribute('action');
        if (!action) return;

        switch (action) {
            case "rate-box":
                rateBox();
                break;

            default:
                break;
        }
    };

    $page.onhide = function () {
        actionStack.remove('about');
    };

    $page.classList.add('about-us');

    $page.append($content);

    document.body.append($page);
}