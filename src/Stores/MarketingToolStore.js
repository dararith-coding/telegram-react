/*
*license
 */

import EventEmitter from './EventEmitter';
// import UserStore from './UserStore';
import TdLibController from '../Controllers/TdLibController';

class MarketingToolStore extends EventEmitter {
    constructor() {
        super();

        this.reset();
        this.loadClientData();

        this.addTdLibListener();
    }

    reset = () => {
        this.bulkMessageContacts = new Map();
        this.selectedBulkMessageContacts = new Map();
        this.selectedBulkMessageGroups = new Map();
    };

    loadClientData = () => {
        const clientData = new Map();
        try {
            let data = localStorage.get('clientData');
            if (data) {
                data = JSON.parse(data);
                if (data) {
                    Object.keys(data).forEach(key => {
                        clientData.set(Number(key), data[key]);
                    });
                }
            }
        } catch {}

        this.clientData = clientData;
    };

    saveClientData = () => {
        const arr = Array.from(this.clientData.entries());
        const obj = arr.reduce((obj, [key, value]) => {
            if (value) {
                obj[String(key)] = value;
            }
            return obj;
        }, {});

        localStorage.setItem('clientData', JSON.stringify(obj));
    };

    
    onUpdate = update => {
        switch (update['@type']) {
            case 'updateAuthorizationState': {
                const { authorization_state } = update;
                if (!authorization_state) break;

                switch (authorization_state['@type']) {
                    case 'authorizationStateClosed': {
                        this.reset();
                        break;
                    }
                }

                break;
            }
            
            
            default:
                break;
        }
    };

    onClientUpdate = update => {
        console.log('ChatStore: ', update);
        switch (update['@type']) {
            case 'clientUpdateChatBackground': {
                const { wallpaper } = update;
                this.wallpaper = wallpaper;

                this.emitUpdate(update);
                break;
            }

            case 'updateSelectedGroup':{
                const {groups} = update;
                this.selectedBulkMessageGroups = groups;

                break;
            }

            case 'updateSelectedContact':{
                const {contacts} = update;
                this.selectedBulkMessageContacts = contacts;
                break;
            }

            case 'updateBulkMessageContacts':{
                const {contacts} = update;
                this.bulkMessageContacts = contacts;

                this.emitUpdate(update);
                break;
            }
            
            

            // case 'sendMarketingToolMessage':{

            //     // this.emitUpdate(update);

            //     this.
            //     break;
            // }
        }
    };




    emitUpdate = update => {
        this.emit(update['@type'], update);
    };

    emitFastUpdate = update => {
        if (this.updating && TdLibController.parameters.fastUpdating) {
            this.skippedUpdates.push(update);
            return;
        }

        this.emit(update['@type'], update);
    };

    addTdLibListener = () => {
        TdLibController.on('update', this.onUpdate);
        TdLibController.on('clientUpdate', this.onClientUpdate);
    };

    removeTdLibListener = () => {
        TdLibController.off('update', this.onUpdate);
        TdLibController.off('clientUpdate', this.onClientUpdate);
    };

    assign(source1, source2) {
        //Object.assign(source1, source2);
        this.set(Object.assign({}, source1, source2));
    }

    
}

const store = new MarketingToolStore();
window.chat = store;
export default store;
