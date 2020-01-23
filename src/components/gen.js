import tag from 'html-tag-js';

/**
 * 
 * @param {string[]} options 
 * @returns {elementContainer}
 */
function listTileGen(options) {
    const menuoptions = {};
    let counter = 0;
    options.map(option => {
        let key = '';
        let text = '';
        if (Array.isArray(option)) {
            key = option[0];
            text = option[1];
        } else if (typeof option === 'string') {
            if (option === '{{saperate}}') {
                key = '{{saperate}}' + (++counter);
                text = option;
            } else {
                key = text = option;
            }
        } else {
            return Error("Expected string or array got " + typeof option);
        }
        const item = text === '{{saperate}}' ? tag('hr') : tag('li', {
            child: tag('span', {
                className: 'text',
                textContent: text
            })
        });
        menuoptions[key] = item;
        return option;
    });

    return menuoptions;
}

/**
 * 
 * @param {string[]} options 
 * @returns {elementContainer}
 */
function iconButton(options) {
    const opts = {};

    options.map(opt => {
        let name = opt,
            className = opt;
        if (Array.isArray(opt)) {
            name = opt[0];
            className = opt[1];
        }

        opts[name] = tag('button', {
            className: `icon ${className}`
        });
        return opt;
    });

    return opts;
}

function listItems(settingsList, settingsOptions, changeSetting) {
    settingsList.textContent = '';
    const settings = {};

    for (let setting of settingsOptions) {
        const text = tag('span', {
            className: 'text',
            textContent: setting.text
        });
        const container = tag('div', {
            className: 'container',
            child: text
        });
        const tmp = tag(setting.type || 'div', {
            className: 'list-item',
            children: [
                tag('i', {
                    className: `icon ${setting.icon || 'no-icon'}`
                }),
                container
            ],
            href: setting.href || undefined
        });
        const subText = tag('small', {
            className: 'value',
            textContent: setting.subText || ''
        });

        if (setting.subText) {
            container.appendChild(subText);
        }

        if (setting.type !== 'a') {
            tmp.onclick = changeSetting.bind({
                key: setting.key,
                text: setting.text,
                changeSubText: function (str) {
                    subText.textContent = str;
                },
                changeText: function (str) {
                    text.textContent = str;
                }
            });
        }

        settings[setting.key] = tmp;
        settingsList.appendChild(tmp);
    }
}

export default {
    listTileGen,
    iconButton,
    listItems: listItems
};