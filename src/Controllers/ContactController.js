
import EventEmitter from '../Stores/EventEmitter';
// import packageJson from '../../package.json';
import axios from 'axios';
import UserStore from '../Stores/UserStore';


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

import TdlipController from './TdLibController';
// import TdClient from '@arseny30/tdweb/dist/tdweb';




const config = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
        'crossdomain':'true',
    }
};


class ContactController extends EventEmitter {
    constructor() {
        super();

        // this.parameters = {
        //     useTestDC: false,
        //     readOnly: false,
        //     verbosity: 1,
        //     jsVerbosity: 3,
        //     fastUpdating: true,
        //     useDatabase: false,
        //     mode: 'wasm'
        // };

        // this.disableLog = true;
    }


    importContactToBackend = async (contacts)=>{
        var telegram_user_id = UserStore.getMyId();
        if(telegram_user_id == null) return [];

        var firstName = '';
        var lastName = '';
        var phone = '';

        var user = UserStore.get(telegram_user_id);
        if (!user && !(firstName || lastName)){
            return null;
        }else{
           
            if (user) {
                firstName = user.first_name;
                lastName = user.last_name;
                phone = user.phone_number;
            }
            // myContacts.push({
            //     id:id,
            //     firstName,
            //     lastName,
            //     phone,
            //     selected:false

            // });
        } 
        const url  = 'http://localhost/Dropbox/telegram-api/backend/web/telegram-contact/import-contact';
        const response = await axios.post(url,{telegram_user_id,first_name:firstName,last_name:lastName,phone,imported_contacts: contacts},config)
        .catch(err=>console.log(err))
        .then(res=>{
            
            console.log('response:',res)
            return res;
        });

        return response;
    }

    getTelegramUserContacts = async ()=>{
        var currentUserPhone = UserStore.getMyId();
        if(currentUserPhone == null) return [];

        const url  = 'http://localhost/Dropbox/telegram-api/backend/web/telegram-contact/get-telegram-user-contact';
        const response = await axios.post(url,{phone:currentUserPhone},config)
        // .catch(err=>console.log(err))
        // .then(res=>{
            
        //     console.log('response:',res)
        //     return res;
        // });

        return response;
    }

    getTelegramUserGroups = async ()=>{
        var currentUserPhone = UserStore.getMyId();
        if(currentUserPhone == null) return [];

        const url  = 'http://localhost/Dropbox/telegram-api/backend/web/telegram-contact/get-telegram-user-group';
        const response = await axios.post(url,{phone:currentUserPhone},config)
        // .catch(err=>console.log(err))
        // .then(res=>{
            
        //     console.log('response:',res)
        //     return res;
        // });

        return response;
    }
   
    postToDatabase = async data =>{
        
        const url  = 'http://localhost/Dropbox/telegram-api/backend/web/telegram-contact/import-contact';
        const response = await axios.post(url,data,config)
        .catch(err=>console.log(err))
        .then(res=>{
            
            console.log('response:',res)
            return res;
        });

        return response;
    }

    //======START MY FUNCTION 
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
    // sendBulkMessage = request => {
    //     console.log('request:',request);
    //     if (!this.client) {
    //         console.log('send (none init)', request);
    //         return;
    //     }

    //     if (!this.disableLog) {
    //         console.log('send', request);

    //         return this.client
    //             .send(request)
    //             .then(result => {
    //                 console.log('send result', result);
    //                 return result;
    //             })
    //             .catch(error => {
    //                 console.error('send error', error);

    //                 throw error;
    //             });
    //     } else {
    //         return this.client.send(request);
    //     }
    // };
}

const controller = new ContactController();

export default controller;
