/*
*license
 */

import EventEmitter from '../Stores/EventEmitter';
import packageJson from '../../package.json';
import { stringToBoolean, getBrowser, getOSName } from '../Utils/Common';



import {
    VERBOSITY_JS_MAX,
    VERBOSITY_JS_MIN,
    VERBOSITY_MAX,
    VERBOSITY_MIN,
    WASM_FILE_HASH,
    WASM_FILE_NAME
} from '../Constants';
import TdClient from 'tdweb/dist/tdweb';
// import TdClient from '@arseny30/tdweb/dist/tdweb';



function databaseExists(dbname, callback) {
    var req = indexedDB.open(dbname);
    var existed = true;
    req.onsuccess = function() {
        req.result.close();
        if (!existed) indexedDB.deleteDatabase(dbname);
        callback(existed);
    };
    req.onupgradeneeded = function() {
        existed = false;
    };
}

class TdLibController extends EventEmitter {
    constructor() {
        super();

        this.parameters = {
            useTestDC: false,
            readOnly: false,
            verbosity: 1,
            jsVerbosity: 3,
            fastUpdating: true,
            useDatabase: false,
            mode: 'wasm'
        };

        this.disableLog = true;
    }

    init = location => {
        this.setParameters(location);

        const { verbosity, jsVerbosity, useTestDC, readOnly, fastUpdating, useDatabase, mode } = this.parameters;
        const dbName = useTestDC ? 'tdlib_test' : 'tdlib';

        databaseExists(dbName, exists => {
            this.clientUpdate({ '@type': 'clientUpdateTdLibDatabaseExists', exists });

            let options = {
                logVerbosityLevel: verbosity,
                jsLogVerbosityLevel: jsVerbosity,
                mode: mode, // 'wasm-streaming'/'wasm'/'asmjs'
                prefix: useTestDC ? 'tdlib_test' : 'tdlib',
                readOnly: readOnly,
                isBackground: false,
                useDatabase: useDatabase,
                wasmUrl: `${WASM_FILE_NAME}?_sw-precache=${WASM_FILE_HASH}`
                // onUpdate: update => this.emit('update', update)
            };

            console.log(
                `[TdLibController] (fast_updating=${fastUpdating}) Start client with params=${JSON.stringify(options)}`
            );

            this.client = new TdClient(options);
            this.client.onUpdate = update => {
                if (!this.disableLog) {
                    if (update['@type'] === 'updateFile') {
                        console.log('receive updateFile file_id=' + update.file.id, update);
                    } else {
                        console.log('receive update', update);
                    }
                }
                this.emit('update', update);
            };
        });
    };

    clientUpdate = update => {
        if (!this.disableLog) {
            console.log('clientUpdate', update);
        }
        console.log('update: ',update);
        if(update['@type']!=='sendMarketingToolMessage'){
            this.emit('clientUpdate', update);

        }
        else{//ELSE IF MY CUSTOM FUNCTION FOR SEND MARKETING TOOL MESSAGE
            // let messageContent = update['input_message_content'];
            this.sendMarketingMessage(update['input_message_content'], update['bulk_message_contacts']);
        }
    };


    setParameters = location => {
        if (!location) return;

        const { search } = location;
        if (!search) return;

        const params = new URLSearchParams(search.toLowerCase());

        if (params.has('test')) {
            this.parameters.useTestDC = stringToBoolean(params.get('test'));
        }

        if (params.has('verbosity')) {
            const verbosity = parseInt(params.get('verbosity'), 10);
            if (verbosity >= VERBOSITY_MIN && verbosity <= VERBOSITY_MAX) {
                this.parameters.verbosity = verbosity;
            }
        }

        if (params.has('jsverbosity')) {
            const jsVerbosity = parseInt(params.get('jsverbosity'), 10);
            if (jsVerbosity >= VERBOSITY_JS_MIN && jsVerbosity <= VERBOSITY_JS_MAX) {
                this.parameters.jsVerbosity = jsVerbosity;
            }
        }

        if (params.has('tag') && params.has('tagverbosity')) {
            const tag = params
                .get('tag')
                .replace('[', '')
                .replace(']', '')
                .split(',');
            const tagVerbosity = params
                .get('tagverbosity')
                .replace('[', '')
                .replace(']', '')
                .split(',');
            if (tag && tagVerbosity && tag.length === tagVerbosity.length) {
                this.parameters.tag = tag;
                this.parameters.tagVerbosity = tagVerbosity;
            }
        }

        if (params.has('readonly')) {
            this.parameters.readOnly = stringToBoolean(params.get('readonly'));
        }

        if (params.has('fastupdating')) {
            this.parameters.fastUpdating = stringToBoolean(params.get('fastupdating'));
        }

        if (params.has('db')) {
            this.parameters.useDatabase = stringToBoolean(params.get('db'));
        }
        if (params.has('mode')) {
            this.parameters.mode = params.get('mode');
        }
        if (params.has('clientlog')) {
            this.disableLog = !stringToBoolean(params.get('clientlog'));
        }
    };

    send = request => {
        if (!this.client) {
            console.log('send (none init)', request);
            return;
        }

        if (!this.disableLog) {
            console.log('send', request);

            return this.client
                .send(request)
                .then(result => {
                    console.log('send result', result);
                    return result;
                })
                .catch(error => {
                    console.error('send error', error);

                    throw error;
                });
        } else {
            return this.client.send(request);
        }
    };

    sendTdParameters = async () => {
        const apiId = process.env.REACT_APP_TELEGRAM_API_ID;
        const apiHash = process.env.REACT_APP_TELEGRAM_API_HASH;
        
        console.log('[td] sendTdParameters', apiHash, apiId);
        if (!apiId || !apiHash) {
            if (
                window.confirm(
                    'API id is missing!\n' +
                        'In order to obtain an API id and develop your own application ' +
                        'using the Telegram API please visit https://core.telegram.org/api/obtaining_api_id'
                )
            ) {
                window.location.href = 'https://core.telegram.org/api/obtaining_api_id';
            }
        }

        const { useTestDC } = this.parameters;
        const { version } = packageJson;

        this.send({
            '@type': 'setTdlibParameters',
            parameters: {
                '@type': 'tdParameters',
                use_test_dc: useTestDC,
                api_id: apiId,
                api_hash: apiHash,
                system_language_code: navigator.language || 'en',
                device_model: getBrowser(),
                system_version: getOSName(),
                application_version: version,
                use_secret_chats: false,
                use_message_database: true,
                use_file_database: false,
                database_directory: '/db',
                files_directory: '/'
            }
            // ,
            // extra: {
            //     a: ['a', 'b'],
            //     b: 123
            // }
        });

        if (this.parameters.tag && this.parameters.tagVerbosity) {
            for (let i = 0; i < this.parameters.tag.length; i++) {
                let tag = this.parameters.tag[i];
                let tagVerbosity = this.parameters.tagVerbosity[i];

                this.send({
                    '@type': 'setLogTagVerbosityLevel',
                    tag: tag,
                    new_verbosity_level: tagVerbosity
                });
            }
        }
    };

    logOut() {
        this.send({ '@type': 'logOut' }).catch(error => {
            this.emit('tdlib_auth_error', error);
        });
    }

    setChatId = (chatId, messageId = null) => {
        const update = {
            '@type': 'clientUpdateChatId',
            chatId: chatId,
            messageId: messageId
        };

        this.clientUpdate(update);
    };

    setMediaViewerContent(content) {
        this.clientUpdate({
            '@type': 'clientUpdateMediaViewerContent',
            content: content
        });
    }


    //=======START MY CUSTOM FUNCTION ========

    sendMarketingMessage = async (input_message_content, bulk_message_contacts) =>{
        
        // const currentUserContacts = ContactController.getTelegramUserContacts();
        // currentUserContacts
        // .catch(err=>console.log(err))
        // .then(response=>{
        //     console.log(response);
        // })

        // let contacts = await this.send({
        //     '@type': 'getContacts'
        // });
       
        var this_send = this.send;

        bulk_message_contacts.map( async (userId,key)=>{
            if(userId != 777000){//TELEGRAM CHAT ID
                await this_send(
                    {
                        '@type': 'sendMessage',
                        chat_id: userId,
                        //reply_to_message_id: replyToMessageId, Identifier of the message to reply to or 0.
                        input_message_content
                    }
                )
                .catch(err=>{

                    if(err['@type']=="error" && err['code']== 5){ // HAVE user in contact but not yet create chat
                        this_send({
                            '@type': 'createPrivateChat',
                            user_id: userId,
                        })
                        .catch(err=>{
                            // console.log(err)
                        })
                        .then(res=>{
                            // console.log('Successful create Private Chat'+userId+' :',res);
                            this_send({
                                '@type': 'sendMessage',
                                chat_id: userId,
                                //reply_to_message_id: replyToMessageId, Identifier of the message to reply to or 0.
                                input_message_content
                            }) 
                            .catch(err=>{
                                // console.log('Error Send Message After Create Private Chat',err)
                            })
                            .then(res=>{
                                // console.log('Successful Message send to chat'+userId+' After Create Private Chat :',res);
                                
                            });
                        });
                    }
    
                    if(err['@type']=="error" && err['code']== 6){ // Dont have user in contact
                        console.log('Contact no belong to this account')
                    }

                })
                .then(res=>{
                    // console.log('send response: ', res)
                })    
            }
        })

        // console.log(bulk_messagimportContacte_contacts);
        return;
        

        console.log('sendMarketingMessage: ',input_message_content);
    }



    importContact = async (jsonArrayContact)=>{
        console.log('handle Add Multi Contact running')
        jsonArrayContact = JSON.parse(jsonArrayContact);
        
        const timeout = ms=>new Promise(res=>setTimeout(res, ms));
        const arrayContact = [];
        for(var sheet in jsonArrayContact){
            var currentSheet = jsonArrayContact[sheet];
            await currentSheet.map((value,index)=>{
                var phone =  value['phone'].split('+').join('');
                phone =  phone.split(' ').join('');
                phone = phone.trim();
                phone = "+"+phone;
                arrayContact.push(
                    {
                  
                        phone_number:phone,
                        first_name: value['first_name'] ? value['first_name'].trim() : 'Not Set'+index,
                        last_name: value['last_name'] ? value['last_name'].trim() : 'Not Set'+index,
                        user_id:0
                        
                    }
                )
                
            })
        }

        console.log('Total Contact: '+arrayContact.length);

        //=====USING ADD CONTACT FUNCTION 
        // for(var key in arrayContact){
        //     var myContact = arrayContact[key];
        //     console.log('myContact:',myContact)
        //     // var importedContact = await this.client
        //     await this.client.send({
        //         '@type': 'addContact',
        //         contact: arrayContact[key],

        //     })
        //     .then(result => {
        //         console.log('send result', result);
        //         return result;
        //     })
        //     .catch(error => {
        //         console.error('send error', error);
        //         console.log('error on : '+myContact.phone_number)
        //         // throw error;
        //     });

        //     // await importedContact.user_ids.map((userId,key)=>{
        //     //     arrayContact[key].user_id = userId;
        //     // })

        //     await timeout(1000);
        // }


        //=====USING IMPORT CONTACT FUNCTION WITH ONLY ONE CONTACT AT ONCE
        // for(var key in arrayContact){
        //     var myContact = arrayContact[key];
        //     console.log('myContact:',myContact)
        //     // var importedContact = await this.client
        //     await this.client.send({
        //         '@type': 'importContacts',
        //         contacts: [arrayContact[key]],

        //     })
        //     .then(result => {
        //         console.log('send result', result);
        //         return result;
        //     })
        //     .catch(error => {
        //         console.error('send error', error);
        //         console.log('error on : '+myContact.phone_number)
        //         // throw error;
        //     });

        //     // await importedContact.user_ids.map((userId,key)=>{
        //     //     arrayContact[key].user_id = userId;
        //     // })

        //     await timeout(1000);
        // }


        
        //=====USING IMPORT CONTACT FUNCTION WITH ALL CONTACT AT ONCE
        
        const request = {
            '@type': 'importContacts',
            contacts: arrayContact
        }
        const importedContact = await this.client
            .send(request)
            .catch(error => {
                console.error('send error', error);

                // throw error;
            })
            .then(result => {
                console.log('send result', result);
                return result;
            })
            

        await importedContact.user_ids.map((userId,key)=>{
            arrayContact[key].user_id = userId;
        })


        // console.log('importedContact: ',importedContact);
        console.log('arrayContact:',arrayContact);
        return [];

        return arrayContact;
        
       
    }

    importContactPreventFlood =async (jsonArrayContact)=>{
        console.log('handle Add Multi Contact running, Add 1 contact in every 5 minutes')
        jsonArrayContact = JSON.parse(jsonArrayContact);
        
        const timeout = ms=>new Promise(res=>setTimeout(res, ms));
        const arrayContact = [];
        for(var sheet in jsonArrayContact){
            var currentSheet = jsonArrayContact[sheet];
            await currentSheet.map((value,index)=>{
                var phone =  value['phone'].split('+').join('');
                phone =  phone.split(' ').join('');
                phone = phone.trim();
                phone = "+"+phone;
                arrayContact.push(
                    {
                  
                        phone_number:phone,
                        first_name: value['first_name'] ? value['first_name'].trim() : 'Not Set',
                        last_name: value['last_name'] ? value['last_name'].trim() : index,
                        user_id:0
                        
                    }
                )
                
            })
        }

        console.log('Total Contact: '+arrayContact.length);

        //=====USING ADD CONTACT FUNCTION 
        for(var key in arrayContact){
            var myContact = arrayContact[key];
            console.log('myContact:',myContact)
            // var importedContact = await this.client
            await this.client.send({
                '@type': 'addContact',
                contact: arrayContact[key],

            })
            .then(result => {
                console.log('send result', result);
                return result;
            })
            .catch(error => {
                console.error('send error', error);
                console.log('error on : '+myContact.phone_number)
                // throw error;
            });

            // await importedContact.user_ids.map((userId,key)=>{
            //     arrayContact[key].user_id = userId;
            // })

            await timeout(300000);// 5 minutes
        }


       
            

        // await importedContact.user_ids.map((userId,key)=>{
        //     arrayContact[key].user_id = userId;
        // })


        // console.log('importedContact: ',importedContact);
        console.log('arrayContact:',arrayContact);
        return [];

        return arrayContact;
        
       
    }
    
    


    addContact = request => {
        console.log('request:',request);
        if (!this.client) {
            console.log('send (none init)', request);
            return;
        }

        if (!this.disableLog) {
            console.log('send', request);

            return this.client
                .send(request)
                .then(result => {
                    console.log('send result', result);
                    return result;
                })
                .catch(error => {
                    console.error('send error', error);

                    throw error;
                });
        } else {
            return this.client.send(request);
        }
    };


    sendBulkMessage = request => {
        console.log('request:',request);
        if (!this.client) {
            console.log('send (none init)', request);
            return;
        }

        if (!this.disableLog) {
            console.log('send', request);

            return this.client
                .send(request)
                .then(result => {
                    console.log('send result', result);
                    return result;
                })
                .catch(error => {
                    console.error('send error', error);

                    throw error;
                });
        } else {
            return this.client.send(request);
        }
    };

    //=======END MY CUSTOM FUNCTION ========

}

const controller = new TdLibController();

export default controller;
