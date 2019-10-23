import Page from "../components/page";
import {
    tag
} from "html-element-js";
import tile from "../components/tile";

export default function aboutUs() {
    const page = Page(strings.about);

    actionStack.push({
        id: 'about',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('about');
    };

    page.classList.add('about-us');

    const content = [
        tag('span', {
            className: 'logo',
            style: {
                backgroundImage: `url(./res/logo/logo.png)`
            }
        }),
        tag('h2', {
            textContent: `Acode (${AppVersion.version})`
        }),
        tag('p', {
            textContent: strings['about app']
        }),
        tag('ul', {
            children: [
                tile({
                    text: tag('a', {
                        href: 'https://telegram.me/joinchat/LbomMBLApFc6fvvdPQMm6w',
                        textContent: 'Telegram'
                    }),
                    lead: tag('i', {
                        className: 'icon telegram'
                    })
                }),
                tile({
                    text: tag('a', {
                        href: 'mailto:dellevenjack@gmail.com',
                        textContent: 'Mail'
                    }),
                    lead: tag('i', {
                        className: 'icon mail'
                    })
                })
            ]
        }),
        tag('h3', {
            textContent: 'Technologies Used'
        }),
        tag('ul', {
            children: [
                tag('li', {
                    child: tag('a', {
                        textContent: 'Ace Editor (Modified)',
                        href: 'https://ace.c9.io'
                    })
                }),
                tag('li', {
                    child: tag('a', {
                        textContent: 'Autosize',
                        href: 'https://www.jacklmoore.com/autosize/'
                    })
                }),
                tag('li', {
                    child: tag('a', {
                        textContent: 'Apache Cordova',
                        href: 'https://cordova.apache.org'
                    })
                }),
                tag('li', {
                    child: tag('a', {
                        textContent: 'Babel js',
                        href: 'https://babeljs.io'
                    })
                }),
                tag('li', {
                    child: tag('a', {
                        textContent: 'Intent (Modified)',
                        href: 'https://github.com/napolitano/cordova-plugin-intent'
                    })
                }),
                tag('li', {
                    child: tag('a', {
                        textContent: 'Webpack',
                        href: 'https://webpack.js.org'
                    })
                })
            ]
        })
    ];

    page.append(tag('div', {
        className: 'main',
        children: content
    }));

    document.body.append(page);
}