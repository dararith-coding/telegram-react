/*
*license
 */

import SupergroupStore from '../Stores/SupergroupStore';
import ChatStore from '../Stores/ChatStore';

export function getChannelStatus(supergroup, chatId) {
    if (!supergroup) return '';

    let { status, is_channel, member_count: count } = supergroup;
    if (!is_channel) return '';

    if (status && status['@type'] === 'chatMemberStatusBanned') {
        return 'channel is inaccessible';
    }

    if (!count) {
        const fullInfo = SupergroupStore.getFullInfo(supergroup.id);
        if (fullInfo) {
            count = fullInfo.member_count;
        }
    }

    if (!count) return '0 subscribers';
    if (count === 1) return '1 subscriber';

    const onlineCount = ChatStore.getOnlineMemberCount(chatId);
    if (onlineCount > 1) {
        return `${count} subscribers, ${onlineCount} online`;
    }

    return `${count} subscribers`;
}
