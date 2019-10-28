import Page from "../components/page";
import gen from "../components/gen";
import {
    tag
} from "html-element-js";
import iconDef from "./iconDef";
import qnaSection from "./qnaSection";

export default function help(opts) {
    const page = Page(strings.help);
    const options = tag('div', {
        className: 'main settings'
    });

    actionStack.push({
        id: 'help',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('help');
    };

    const settingsOptions = [{
            key: 'icons',
            text: strings['icons definition'],
            icon: 'toys'
        },
        {
            key: 'qa',
            text: strings['qa section'],
            icon: 'chat_bubble'
        },
        {
            key: 'Q8',
            text: strings.Q8,
            type: 'a',
            href: 'mailto:dellevenjack@gmail.com?subject=feedback - Acode code editor for android&body=version-' + AppVersion.version
        },
        {
            key: 'Q7',
            text: strings.Q7,
            type: 'a',
            href: 'https://telegram.me/joinchat/LbomMBLApFc6fvvdPQMm6w',
        }
    ];

    gen.settingsItems(options, settingsOptions, changeSetting);

    function changeSetting() {
        switch (this.key) {
            case 'icons':
                iconDef(opts);
                break;

            case 'qa':
                qnaSection();
                break;

            default:
                break;
        }
    }

    page.append(options);
    document.body.append(page);
}