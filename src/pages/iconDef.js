import Page from "../components/page";
import tag from 'html-tag-js';
import row1 from '../views/footer/row1.hbs';
import row2 from '../views/footer/row2.hbs';

export default function iconDef(options) {
    const page = Page(strings['icons definition']);
    const iconList = tag('div', {
        className: 'main grid'
    });

    actionStack.push({
        id: 'iconDef',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('iconDef');
    };

    const icons = [...tag.parse(row1).children, ...tag.parse(row2).children];
    const height = ((innerWidth > 600 ? 600 : innerWidth) / 6) + 'px';

    icons.map(icon => {
        const action = icon.getAttribute('action');
        icon.onclick = onclick.bind({
            key: action + ' defination'
        });
        icon.style.width = height;
        icon.style.height = height;
        iconList.append(icon);
    });

    function onclick() {
        alert(strings.info.toLocaleUpperCase(), strings[this.key]);
    }

    page.append(iconList);
    document.body.append(page);
}