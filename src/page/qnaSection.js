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