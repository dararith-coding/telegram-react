/*
*license
 */

export class KeyboardHandler {
    constructor(onKeyDown) {
        this.onKeyDown = onKeyDown;
    }
}

class KeyboardManager {
    constructor() {
        this.handlers = [];

        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = event => {
        const { handlers } = this;
        if (!handlers.length) return;

        const handler = handlers[handlers.length - 1];
        if (handler) {
            // event.preventDefault();
            // event.stopPropagation();

            const { onKeyDown } = handler;
            if (onKeyDown) {
                onKeyDown(event);
            }
        }
    };

    add(handler) {
        // console.log('[sm] add', page);
        this.handlers.push(handler);
    }

    remove(handler) {
        // console.log('[sm] remove', page);
        const index = this.handlers.indexOf(handler);
        if (index === -1) return;

        this.handlers.splice(index, 1);
    }
}

const manager = new KeyboardManager();
export default manager;