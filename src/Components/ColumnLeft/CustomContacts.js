/*
*license
 */

import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ArrowBackIcon from '../../Assets/Icons/Back';
import CloseIcon from '../../Assets/Icons/Close';
import User from '../Tile/User';
import SearchInput from './Search/SearchInput';
import VirtualizedList from '../Additional/VirtualizedList';
import { loadUsersContent } from '../../Utils/File';
import { debounce, throttle } from '../../Utils/Common';
import { openUser } from '../../Actions/Client';
import { getUserFullName } from '../../Utils/User';
import CacheStore from '../../Stores/CacheStore';
import FileStore from '../../Stores/FileStore';
import UserStore from '../../Stores/UserStore';
import TdLibController from '../../Controllers/TdLibController';
import './CustomContacts.css';




import { getEntities, getNodes, isTextMessage } from '../../Utils/Message';
import ContactController from '../../Controllers/ContactController';

class UserListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const { userId, style } = this.props;
        if (nextProps.userId !== userId) {
            return true;
        }

        if (nextProps.style.top !== style.top) {
            return true;
        }

        return false;
    }

    render() {
        const { userId, onClick, style } = this.props;

        return (
            <ListItem className='user-list-item' onClick={() => onClick(userId)} button style={style}>
                <User userId={userId} />
            </ListItem>
        );
    }
}

class Contacts extends React.Component {
    constructor(props) {
        super(props);

        this.searchInputRef = React.createRef();
        this.listRef = React.createRef();
        this.searchListRef = React.createRef();

        this.state = {
            items: null,
            searchItems: null
        };

        this.handleDebounceScroll = debounce(this.handleDebounceScroll, 100, false);
        this.handleThrottleScroll = throttle(this.handleThrottleScroll, 200, false);
    }

    componentDidMount() {
        const { current } = this.searchInputRef;
        if (current) {
            setTimeout(() => current.focus(), 50);
        }

        this.loadContent();
    }

    handleScroll = event => {
        this.handleDebounceScroll();
        this.handleThrottleScroll();
    };

    handleDebounceScroll() {
        this.loadRenderIdsContent();
    }

    handleThrottleScroll() {
        this.loadRenderIdsContent();
    }

    loadRenderIdsContent = () => {
        const { items, searchItems } = this.state;

        const currentItems = searchItems || items;

        const { current } = currentItems === searchItems ? this.searchListRef : this.listRef;
        if (!current) return;

        const renderIds = current.getListRenderIds();
        if (renderIds.size > 0) {
            const userIds = [];
            [...renderIds.keys()].forEach(key => {
                userIds.push(currentItems.user_ids[key]);
            });

            const store = FileStore.getStore();
            loadUsersContent(store, userIds);
        }
    };

    async loadContent() {
        let contacts = CacheStore.contacts;
        if (!contacts) {
            contacts = await TdLibController.send({
                '@type': 'getContacts'
            });
            contacts.user_ids = contacts.user_ids.sort((x, y) => getUserFullName(x).localeCompare(getUserFullName(y)));
            CacheStore.contacts = contacts;
        }

        const store = FileStore.getStore();
        loadUsersContent(store, contacts.user_ids.slice(0, 20));

        this.setState({
            items: contacts
        });
    }

    handleOpenUser = userId => {
        openUser(userId, false);
        this.handleClose();
    };

    renderItem = ({ index, style }, items) => {
        const userId = items.user_ids[index];

        return <UserListItem key={userId} userId={userId} onClick={() => this.handleOpenUser(userId)} style={style} />;
    };

    handleSearch = async text => {
        const query = text.trim();
        if (!query) {
            this.setState({
                searchItems: null
            });
            return;
        }

        const searchItems = await TdLibController.send({
            '@type': 'searchContacts',
            query,
            limit: 1000
        });
        searchItems.user_ids = searchItems.user_ids.sort((x, y) =>
            getUserFullName(x).localeCompare(getUserFullName(y))
        );

        const store = FileStore.getStore();
        loadUsersContent(store, searchItems.user_ids.slice(0, 20));

        this.setState({ searchItems });
    };

    handleClose = () => {
        TdLibController.clientUpdate({
            '@type': 'clientUpdateCustomContacts',
            open: false
        });
    };

    
    //MY FUNCTION 

    handleAddContact = ()=>{
        console.log('handle Add Multi Contact running')
        TdLibController.addContact({
            '@type': 'importContacts',
            contacts:[
                {
                    phone_number:"+85592718998",
                    first_name:"Khut",
                    last_name:"Rathana",
                    //vcard:"", Additional data about the user in a form of vCard; 0-2048 bytes in length.
                    user_id:0
                },
                {
                    phone_number:"+855968585789",
                    first_name:"Kreom",
                    last_name:"Dararith",
                    //vcard:"", Additional data about the user in a form of vCard; 0-2048 bytes in length.
                    user_id:0
                },
                {
                    phone_number:"+85595208717",
                    first_name:"Cellcard",
                    last_name:"Phone Test",
                    //vcard:"", Additional data about the user in a form of vCard; 0-2048 bytes in length.
                    user_id:0
                },
                {
                    phone_number:"+85589322588",
                    first_name:"Pheakdey",
                    last_name:"ACE.IT",
                    //vcard:"", Additional data about the user in a form of vCard; 0-2048 bytes in length.
                    user_id:0
                },
                {
                    phone_number:"+85586334497",
                    first_name:"Sela",
                    last_name:"Tak",
                    //vcard:"", Additional data about the user in a form of vCard; 0-2048 bytes in length.
                    user_id:0
                }
            ]
        })
        .catch(err=>console.log(err))
        .then(res=>{
            console.log('response:',res);
        });


    }

    handleSendBulkMessageOld = ()=>{
        // console.log('helloooooooo')
        let contacts = this.state.items;
        console.log('contacts:',contacts);
      
        return;
        if(contacts != null){
            contacts.user_ids.map((value,index)=>{
                if(value == '697885318'){
                    var innerHTML = "Hello, This message send from Testing API Telegram ReactJS APP";
                    var { text, entities } = getEntities(innerHTML);
                    setTimeout(()=>{
                        TdLibController.send({
                            '@type': 'sendMessage',
                            chat_id: value,
                            //reply_to_message_id: replyToMessageId, Identifier of the message to reply to or 0.
                            input_message_content: {
                                '@type':'inputMessageText',
                                text:{
                                    '@type': 'formattedText',
                                    text,
                                    entities
                                },
                                disable_web_page_preview: false,
                                clear_draft: false
                            }
                        })

                        // TdLibController.sendBulkMessage({
                        //     '@type': 'getChat',
                        //     chat_id: value
                        // })
                        .catch(err=>console.log(err))
                        .then(res=>{
                            console.log('get chat'+value+' :',res);

                            
                        });
                    },1000)
                }

                
            });
        }
        
    }

    handleSendBulkMessage = ()=>{
        this.sendBulkMessageToAllContacts();
        // this.sendBulkMessageToAllChatRooms();
        
    }

    sendBulkMessageToAllContacts = ()=>{
        let {user_ids} = this.state.items;
        
        user_ids.map((value,index)=>{
            // if(value.id == '697885318'){
            // if(value != '777000' && value =='718841028'){//TELEGRAM && sela tek
            
            if(value != '777000'){//TELEGRAM && sela tek
                var innerHTML = "Hello, This message send from Testing API Telegram ReactJS APP";
                var { text, entities } = getEntities(innerHTML);
                setTimeout(()=>{
                    TdLibController.send({
                        '@type': 'sendMessage',
                        chat_id: value,
                        //reply_to_message_id: replyToMessageId, Identifier of the message to reply to or 0.
                        input_message_content: {
                            '@type':'inputMessageText',
                            text:{
                                '@type': 'formattedText',
                                text,
                                entities
                            },
                            disable_web_page_preview: false,
                            clear_draft: false
                        }
                    })

                    // TdLibController.sendBulkMessage({
                    //     '@type': 'getChat',
                    //     chat_id: value
                    // })
                    .catch(err=>{
                        console.log(err)
                        if(err['@type']=="error" && err['code']==5){
                            TdLibController.send({
                                '@type': 'createPrivateChat',
                                user_id: value,
                            })
                            .catch(err=>console.log(err))
                            .then(res=>{
                                console.log('Successful create Private Chat'+value+' :',res);
                                TdLibController.send({
                                    '@type': 'sendMessage',
                                    chat_id: value,
                                    //reply_to_message_id: replyToMessageId, Identifier of the message to reply to or 0.
                                    input_message_content: {
                                        '@type':'inputMessageText',
                                        text:{
                                            '@type': 'formattedText',
                                            text,
                                            entities
                                        },
                                        disable_web_page_preview: false,
                                        clear_draft: false
                                    }
                                }) 
                                .catch(err=>console.log('Error Send Message After Create Private Chat',err))
                                .then(res=>{
                                    console.log('Successful Message send to chat'+value+' After Create Private Chat :',res);
                                    
                                });
                            });
                        }
                    })
                    .then(res=>{
                        console.log('Message send to chat'+value+' :',res);
                        
                    });
                },1000)
            }

            
        });
    }

    sendBulkMessageToAllChatRooms = ()=>{
        let {chats} = this.state;
        
        chats.map((value,index)=>{
            // if(value.id == '697885318'){
            if(value.id != '777000'){//TELEGRAM 
                
                var innerHTML = "Hello, This message send from Testing API Telegram ReactJS APP";
                var { text, entities } = getEntities(innerHTML);
                setTimeout(()=>{
                    TdLibController.send({
                        '@type': 'sendMessage',
                        chat_id: value.id,
                        //reply_to_message_id: replyToMessageId, Identifier of the message to reply to or 0.
                        input_message_content: {
                            '@type':'inputMessageText',
                            text:{
                                '@type': 'formattedText',
                                text,
                                entities
                            },
                            disable_web_page_preview: false,
                            clear_draft: false
                        }
                    })

                    // TdLibController.sendBulkMessage({
                    //     '@type': 'getChat',
                    //     chat_id: value
                    // })
                    .catch(err=>console.log(err))
                    .then(res=>{
                        console.log('get chat'+value.id+' :',res);

                        
                    });
                },1000)
            }

            
        });
    }

    handleGetContactList = async ()=>{
        let contacts = CacheStore.contacts;
        if (!contacts) {
            contacts = await TdLibController.send({
                '@type': 'getContacts'
            });
            contacts.user_ids = contacts.user_ids.sort((x, y) => {
                        console.log(getUserFullName(x));
                return getUserFullName(x).localeCompare(getUserFullName(y));
            });
            // CacheStore.contacts = contacts;
        }else{
            /*
            FOR TESTING
            contacts.user_ids = contacts.user_ids.sort((x, y) => {
                console.log(getUserFullName(x));
                return getUserFullName(x).localeCompare(getUserFullName(y));
            });
            */
            contacts.user_ids = contacts.user_ids.sort((x, y) => {
                console.log(getUserFullName(x));
                
                return getUserFullName(x).localeCompare(getUserFullName(y));
            });

            
        }

        var testVar = [];

            await contacts.user_ids.forEach((id)=>{
                var user = UserStore.get(id);
                if (!user && !(firstName || lastName)){
                    return null;
                }else{
                    var firstName = '';
                    var lastName = '';
                    var phone = '';
                    if (user) {
                        firstName = user.first_name;
                        lastName = user.last_name;
                        phone = user.phone_number;
                    }
                    testVar.push({
                        id:id,
                        firstName,
                        lastName,
                        phone
    
                    });
                } 
                
            })

            console.log('contact info:',testVar)
        // console.log("contact list: ",contacts);
    }

    handleTestImportContact = ()=>{
        var data = {'name':'hello world'};
        ContactController.postToDatabase(data)
        .catch(err=>console.log(err))
        .then(res=>{
            console.log('res',res)
        })
    }

    handleSendMessage = ()=>{
        var innerHTML = "Hello, This message send from Testing API Telegram ReactJS APP";
        var { text, entities } = getEntities(innerHTML);
        const ChatID = '697885318';
        setTimeout(()=>{
            TdLibController.send({
                '@type': 'sendMessage',
                chat_id: ChatID,
                //reply_to_message_id: replyToMessageId, Identifier of the message to reply to or 0.
                input_message_content: {
                    '@type':'inputMessageText',
                    text:{
                        '@type': 'formattedText',
                        text,
                        entities
                    },
                    disable_web_page_preview: false,
                    clear_draft: false
                }
            })
            .catch(err=>{
                console.log(err)
                if(err['@type']=="error" && err['code']== 5){ // HAVE user in contact but not yet create chat
                    TdLibController.send({
                        '@type': 'createPrivateChat',
                        user_id: ChatID,
                    })
                    .catch(err=>console.log(err))
                    .then(res=>{
                        console.log('Successful create Private Chat'+ChatID+' :',res);
                        TdLibController.send({
                            '@type': 'sendMessage',
                            chat_id: ChatID,
                            //reply_to_message_id: replyToMessageId, Identifier of the message to reply to or 0.
                            input_message_content: {
                                '@type':'inputMessageText',
                                text:{
                                    '@type': 'formattedText',
                                    text,
                                    entities
                                },
                                disable_web_page_preview: false,
                                clear_draft: false
                            }
                        }) 
                        .catch(err=>console.log('Error Send Message After Create Private Chat',err))
                        .then(res=>{
                            console.log('Successful Message send to chat'+ChatID+' After Create Private Chat :',res);
                            
                        });
                    });
                }

                if(err['@type']=="error" && err['code']== 6){ // Dont have user in contact
                    console.log('Contact no belong to this account')
                }


            })
            .then(res=>{
                console.log('Message send to chat'+ChatID+' :',res);
                
            });
        },1000)
    }

    handleAddNoneExistingContact = ()=>{
        // const user_id = '697885318';
        // TdLibController.send({
        //     '@type': 'getUser',
        //     user_id,
            
        // })
        // .catch(err=>{
        //     console.log(err)
        // })
        // .then(res=>{
        //     console.log(res)
        // })
        console.log('Function add none existing contact, not implement yet!');
        
    }

    render() {
        const { popup } = this.props;
        const { items, searchItems } = this.state;

        const style = popup ? { minHeight: 800 } : null;
        return (
            <>
                <div className='header-master'>
                    <IconButton className='header-left-button' onClick={this.handleClose}>
                        { popup ? <CloseIcon/> : <ArrowBackIcon /> }
                    </IconButton>
                    <SearchInput inputRef={this.searchInputRef} onChange={this.handleSearch} />
                </div>

                <button className="btn my-custom-button" onClick={this.handleAddContact}> Add Contact Test</button>
                    <button className="btn my-custom-button" onClick={this.handleSendBulkMessage}> Send Bulk Message</button>
                    <button className="btn my-custom-button" onClick={this.handleGetContactList}> Get Contact List</button>
                    <button className="btn my-custom-button" onClick={this.handleSendMessage}> Send One Message</button>
                    <button className="btn my-custom-button" onClick={this.handleTestImportContact}> Test Import Contact</button>
                    <button className="btn my-custom-button" onClick={this.handleAddNoneExistingContact}> Get User By ID</button>
                    <br/>
                    <hr className="my-hr-divider"/>
                <div className='contacts-content' style={style}>



                    {items && (
                        <VirtualizedList
                            ref={this.listRef}
                            className='contacts-list'
                            source={items.user_ids}
                            rowHeight={72}
                            overScanCount={20}
                            renderItem={x => this.renderItem(x, items)}
                            onScroll={this.handleScroll}
                        />
                    )}
                    {searchItems && (
                        <VirtualizedList
                            ref={this.searchListRef}
                            className='contacts-list contacts-search-list'
                            source={searchItems.user_ids}
                            rowHeight={72}
                            overScanCount={20}
                            renderItem={x => this.renderItem(x, searchItems)}
                            onScroll={this.handleScroll}
                        />
                    )}
                </div>
            </>
        );
    }
}

Contacts.propTypes = {
    popup: PropTypes.bool
};

export default Contacts;
