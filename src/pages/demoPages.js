import tag from 'html-tag-js';
import themeSettings from "./settings/themeSettings";
import settingsMain from "./settings/mainSettings";
import qnaSection from "./qnaSection";

export default function demoPage() {
    const nextBtn = tag('i', {
        className: 'icon keyboard_arrow_right'
    });
    const prevBtn = tag('i', {
        className: 'icon keyboard_arrow_left'
    });
    const progress = (function () {
        const ar = [];
        for (let i = 0; i < 8; ++i) {
            ar[i] = tag('i', {
                className: 'icon circle-outline'
            });
        }
        return ar;
    })();
    const page = tag('div', {
        className: 'page demo-page',
        style: {
            backgroundColor: '#99f'
        },
        child: tag('footer', {
            className: 'buttons-container',
            style: {
                boxShadow: 'none'
            },
            children: [
                prevBtn,
                tag('div', {
                    className: 'progress',
                    children: [...progress]
                }),
                nextBtn
            ]
        })
    });
    const contents = [
        [strings.welcome, 'home'],
        [strings['control file and folders'], 'file-control'],
        [strings['use emmet'], 'emmet'],
        [strings['open files and folders'], 'file-browser'],
        [strings['use quick tools'], 'quick-tools'],
        [strings['run your web app'],
            ['web-app-preview']
        ],
        [strings['see logs and errors'],
            ['console']
        ]
    ];
    const images = (() => {
        const ar = [];
        for (let i = 0; i < 7; ++i) {
            const img = tag('img', {
                src: `./res/sshots/${contents[i][1]}-min.png`
            });
            document.body.append(img);
            ar[i] = tag('div', {
                className: 'view',
                children: [
                    tag('span', {
                        className: 'heading',
                        textContent: contents[i][0]
                    }),
                    img
                ]
            });
        }
        return ar;
    })();
    const main = tag('div', {
        className: 'main',
        children: images
    });
    let currentPage = 0;

    progress[0].classList.add('fill');
    page.append(main);
    document.body.append(page);

    return new Promise((resolve) => {
        nextBtn.onclick = nextPage;
        prevBtn.onclick = prevPage;

        main.append(tag('div', {
            className: 'view tiles',
            children: [
                tag('a', {
                    href: "https://play.google.com/store/apps/details?id=org.pocketworkstation.pckeyboard",
                    className: 'rec-tile install',
                    textContent: strings.o1
                }),
                tag('div', {
                    className: 'rec-tile',
                    textContent: strings.o2,
                    onclick: function () {
                        qnaSection();
                    }
                }),
                tag('div', {
                    className: 'rec-tile',
                    textContent: strings.theme,
                    onclick: function () {
                        themeSettings({
                            editors: []
                        });
                    }
                }),
                tag('div', {
                    className: 'rec-tile',
                    textContent: strings["change language"],
                    onclick: function () {
                        settingsMain({
                            editors: []
                        }, true);
                    }
                })
            ]
        }));

        document.ontouchstart = function (e) {
            main.startX = e.touches[0].clientX;
            if (!main.tleft) main.tleft = 0;
            document.ontouchmove = move;
            document.ontouchend = end;
        };

        function nextPage() {
            if ((currentPage + 1) === progress.length) {
                page.classList.add('hide');
                setTimeout(() => {
                    page.remove();
                    document.ontouchstart = null;
                    resolve();
                }, 300);
                return;
            }
            progress[currentPage].classList.remove('fill');
            progress[currentPage + 1].classList.add('fill');
            main.tleft = -innerWidth * (++currentPage);
            main.style.transform = `translate3d(${main.tleft}px, 0, 0)`;
        }

        function prevPage() {
            if (currentPage === 0) return;
            progress[currentPage].classList.remove('fill');
            main.tleft = -innerWidth * (--currentPage);
            main.style.transform = `translate3d(${main.tleft}px, 0, 0)`;
            progress[currentPage].classList.add('fill');
        }

        function move(e) {
            main.moveX = e.touches[0].clientX;
            const move = main.startX - main.moveX;
            main.style.transition = 'none';
            if (main.tleft === 0 && move < 0) return;
            main.style.transform = `translate3d(${main.tleft - move}px, 0, 0)`;
        }

        function end() {
            main.style.transition = null;
            if (main.moveX) {
                const move = main.startX - main.moveX;
                if (move > 0 && move > innerWidth / 4) nextPage();
                else if (move < 0 && move < -innerWidth / 4) prevPage();
                else main.style.transform = `translate3d(${main.tleft}px, 0, 0)`;
            }

            main.moveX = null;
            document.ontouchmove = null;
            document.ontouchend = null;
        }
    });
}