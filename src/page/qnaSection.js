import Page from "../components/page";
import gen from "../components/gen";
import {
    tag
} from "html-element-js";

export default function qnaSection() {
    const page = Page(strings['qa section']);
    const questionList = tag('div', {
        className: 'main settings'
    });
    actionStack.push({
        id: 'qnaSection',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('qnaSection');
    };

    const questions = [{
            key: 'Q1',
            text: strings.Q1
        },
        {
            key: 'Q2',
            text: strings.Q2
        },
        {
            key: 'Q3',
            text: strings.Q3
        },
        {
            key: 'Q4',
            text: strings.Q4
        },
        {
            key: 'Q5',
            text: strings.Q5
        },
        {
            key: 'Q6',
            text: strings.Q6
        },
        {
            key: 'Q7',
            text: strings.Q7,
            type: 'a',
            href: 'https://telegram.me/joinchat/LbomMBLApFc6fvvdPQMm6w',
        },
        {
            key: 'Q8',
            text: strings.Q8,
            type: 'a',
            href: 'mailto:dellevenjack@gmail.com'
        }
    ];

    gen.settingsItems(questionList, questions, changeSetting);

    function changeSetting() {
        if (this.key === 'Q7') {

        } else if (this.key === 'Q8') {

        } else {
            alert(strings.info.toUpperCase(), strings['A' + this.key.slice(1)]);
        }
    }

    page.append(questionList);
    document.body.append(page);
}