/*
*license
 */

import { TYPING_OUTPUT_INTERVAL_S } from '../Constants';
import TdLibController from '../Controllers/TdLibController';

class OutputTypingManager {
    constructor(chatId) {
        this.chatId = chatId;
        this.lastAction = null;
    }

    setTyping(action) {
        if (!this.chatId) return;

        if (this.lastAction && this.lastAction['@type'] === action['@type']) {
            let now = new Date();
            now.setSeconds(now.getSeconds() - TYPING_OUTPUT_INTERVAL_S);
            if (this.lastTypingDate && this.lastTypingDate > now) {
                return;
            }
        }

        this.lastAction = action;
        this.lastTypingDate = new Date();

        TdLibController.send({
            '@type': 'sendChatAction',
            chat_id: this.chatId,
            action: action
        });
    }
}

export default OutputTypingManager;