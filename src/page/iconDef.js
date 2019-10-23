import Page from "../components/page";
import gen from "../components/gen";
import {
    tag
} from "html-element-js";

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

    const icons = gen.iconButton([...options.row1, ...options.row2]);
    const height = ((innerWidth > 600 ? 600 : innerWidth) / 6) + 'px';

    for (const key in icons) {
        icons[key].onclick = onclick.bind({
            key: key + ' defination'
        });
        icons[key].style.width = height;
        icons[key].style.height = height;
        iconList.append(icons[key]);
    }

    function onclick() {
        alert(strings.info.toLocaleUpperCase(), strings[this.key]);
    }

    page.append(iconList);
    document.body.append(page);
}