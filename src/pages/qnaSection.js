import Page from "../components/page";
import gen from "../components/gen";
import tag from 'html-tag-js';

export default function qnaSection() {
    const page = Page(strings['qa section']);
    const questionList = tag('div', {
        className: 'main list'
    });
    actionStack.push({
        id: 'qnaSection',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('qnaSection');
    };

    const questions = [{
            key: 'Q2',
            text: strings.Q2
        },
        {
            key: 'Q5',
            text: strings.Q5
        },
        {
            key: 'Q6',
            text: strings.Q6
        }
    ];

    gen.listItems(questionList, questions, changeSetting);

    function changeSetting() {
        alert(strings.info.toUpperCase(), strings['A' + this.key.slice(1)]);
    }

    page.append(questionList);
    document.body.append(page);
}