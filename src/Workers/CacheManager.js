/*
*license
 */

class CacheManager {
    async load(key) {
        const value = localStorage.getItem(key);
        if (!value) return null;

        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    async save(key, value) {


        if(value.chats){
            const marketingToolFakeChat = {
                "@type":"chat",
                "id":1111, //MARKETING TOOL
                "type":{
                  "@type":"chatTypePrivate",
                  "user_id":"marketingTool"
                },
                "title":"Marketing Tool",
                "photo":{
                  "@type":"chatPhoto",
                  "small":{
                    "@type":"file",
                    "id":1,
                    "size":0,
                    "expected_size":0,
                    "local":{
                      "@type":"localFile",
                      "path":"",
                      "can_be_downloaded":true,
                      "can_be_deleted":false,
                      "is_downloading_active":false,
                      "is_downloading_completed":true,
                      "download_offset":0,
                      "downloaded_prefix_size":0,
                      "downloaded_size":0
                    },
                    "remote":{
                      "@type":"remoteFile",
                      "id":"AQADAQADr6cxGyjbCwAJRPdrBgAEAgADKNsLAAW77XFbp5pF0aozAAIYBA",
                      "unique_id":"AQADRPdrBgAEqjMAAg",
                      "is_uploading_active":false,
                      "is_uploading_completed":true,
                      "uploaded_size":0
                    }
                  },
                  "big":{
                    "@type":"file",
                    "id":2,
                    "size":0,
                    "expected_size":0,
                    "local":{
                      "@type":"localFile",
                      "path":"",
                      "can_be_downloaded":true,
                      "can_be_deleted":false,
                      "is_downloading_active":false,
                      "is_downloading_completed":false,
                      "download_offset":0,
                      "downloaded_prefix_size":0,
                      "downloaded_size":0
                    },
                    "remote":{
                      "@type":"remoteFile",
                      "id":"AQADAQADr6cxGyjbCwAJRPdrBgAEAwADKNsLAAW77XFbp5pF0awzAAIYBA",
                      "unique_id":"AQADRPdrBgAErDMAAg",
                      "is_uploading_active":false,
                      "is_uploading_completed":true,
                      "uploaded_size":0
                    }
                  }
                },
                "permissions":{
                  "@type":"chatPermissions",
                  "can_send_messages":true,
                  "can_send_media_messages":true,
                  "can_send_polls":true,
                  "can_send_other_messages":true,
                  "can_add_web_page_previews":true,
                  "can_change_info":false,
                  "can_invite_users":false,
                  "can_pin_messages":false
                },
                "order":"6826228184820744200",
                "is_pinned":false,
                "is_marked_as_unread":false,
                "is_sponsored":false,
                "has_scheduled_messages":false,
                "can_be_deleted_only_for_self":true,
                "can_be_deleted_for_all_users":true,
                "can_be_reported":false,
                "default_disable_notification":false,
                "unread_count":0,
                "last_read_inbox_message_id":8388608,
                "last_read_outbox_message_id":0,
                "unread_mention_count":0,
                "notification_settings":{
                  "@type":"chatNotificationSettings",
                  "use_default_mute_for":true,
                  "mute_for":0,
                  "use_default_sound":true,
                  "sound":"default",
                  "use_default_show_preview":true,
                  "show_preview":false,
                  "use_default_disable_pinned_message_notifications":true,
                  "disable_pinned_message_notifications":false,
                  "use_default_disable_mention_notifications":true,
                  "disable_mention_notifications":false
                },
                "pinned_message_id":0,
                "reply_markup_message_id":0,
                "client_data":"",
                "chat_list":{
                  "@type":"chatListMain"
                }
            
            }
            value.chats.push(marketingToolFakeChat)
            const myModifyValue = value;//new value

            localStorage.setItem(key, JSON.stringify(myModifyValue));

        }else{
            localStorage.setItem(key, JSON.stringify(value)); //original code

        }
       
    }

    async remove(key) {
        localStorage.removeItem(key);
    }

    async clear() {
        localStorage.clear();
    }
}

const manager = new CacheManager();
export default manager;
