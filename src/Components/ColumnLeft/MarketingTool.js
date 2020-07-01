/*
*license
 */

import React, {useState,useEffect} from 'react';
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
import { getUserFullName, getUserInfo } from '../../Utils/User';
import CacheStore from '../../Stores/CacheStore';
import FileStore from '../../Stores/FileStore';
import UserStore from '../../Stores/UserStore';
import TdLibController from '../../Controllers/TdLibController';
import './MarketingTool.css';


import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Zoom from '@material-ui/core/Zoom';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';

import { getEntities, getNodes, isTextMessage } from '../../Utils/Message';
import ContactController from '../../Controllers/ContactController';

import axios from 'axios';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Zoom direction="zoom" ref={ref} {...props} />;
  });


const MyCheckboxComponent = (props)=>{
    const {id, firstName, lastName, phone , selected,index} = props;
    
    return (
        <>
            <FormControlLabel
                control={
                <Checkbox
                    checked={selected}
                    onChange={()=>props.handleChange(index)}
                    name="contacts[]"
                    color="primary"
                    value={id || ""}
                    
                />
                }
                label={`${firstName} ${lastName}`}
                
            />
            {/* <FormHelperText>{`${phone}`}</FormHelperText> */}
        </>
    )
}


class MarketingTool extends React.Component {
    constructor(props) {
        super(props);

        this.searchInputRef = React.createRef();
        this.listRef = React.createRef();
        this.searchListRef = React.createRef();

        this.state = {
            items: null,
            searchItems: null,
            openImportContactDialog : false,
            openPopupDialog:false,
            popupDialogMessage:'success',

            openSelectContactDialog:false,
            contacts:[
                {   
                    id:'123123',
                    firstName:'test',
                    lastName:1,
                    phone:'8559123123',
                    selected:false
                },
                {
                    id:'222',
                    firstName:'test',
                    lastName:2,
                    phone:'8559123123',
                    selected:false
                }
            ],
            // contacts:[],
            selectedContacts:[],
            selectAllContacts:false,


            groups:[
                {   
                    id:'123123',
                    name:'test group 1',
                    contacts:[1,2,3],
                    phone:'8559123123',
                    selected:false
                },
                {   
                    id:'222',
                    name:'test group 2',
                    contacts:[1,2,3],
                    phone:'42424',
                    selected:false
                },
            ],
            // groups:[],
            selectedGroups:[],
            selectAllGroups:false
        };

        this.handleDebounceScroll = debounce(this.handleDebounceScroll, 100, false);
        this.handleThrottleScroll = throttle(this.handleThrottleScroll, 200, false);

        this.refImportContactTextField = React.createRef();
        this.selectContactRef = React.createRef();
    }

    // shouldComponentUpdate(nextProps, nextState) {

    // }

    componentDidMount() {
        const { current } = this.searchInputRef;
        if (current) {
            setTimeout(() => current.focus(), 50);
        }

        // this.loadContent();

        this.handleGetContactList();

    }

    // componentWillUnmount() {

    // }



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




    handleClose = () => {
        TdLibController.clientUpdate({
            '@type': 'clientUpdateMarketingTool',
            open: false
        });
    };

    
    //MY FUNCTION 

    handleSelectGroup = ()=>{
        
    }


    handleGetContactList = async ()=>{
        let contacts = CacheStore.contacts;
        if (!contacts) {
            contacts = await TdLibController.send({
                '@type': 'getContacts'
            });
            contacts.user_ids = contacts.user_ids.sort((x, y) => {
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

        var myContacts = [];

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
                    myContacts.push({
                        id:id,
                        firstName,
                        lastName,
                        phone,
                        selected:false
    
                    });
                } 
                
            })

        console.log('contact info:',myContacts)
        this.setState({contacts:myContacts});
        // console.log("contact list: ",contacts);
    }

    handleGetGroupListFromBackend = async ()=>{
        // const groups = await ContactController.getG;

    }

    handleUpdateContactsToMarketingToolStore = ()=>{
        const { selectedContacts, selectedGroups} = this.state;

        let contactFromGroups = [];
        selectedGroups.map(value=>{
            if(value.selected == true){
                contactFromGroups = contactFromGroups.concat(value.contacts);
            }
        })
        contactFromGroups = contactFromGroups.concat(selectedContacts);
         
        const onlyUnique = (value, index, self) =>{ 
            return self.indexOf(value) === index;
        }
        var uniqueContacts = contactFromGroups.filter( onlyUnique );

        TdLibController.clientUpdate({
            '@type': 'updateBulkMessageContacts',
            contacts: uniqueContacts
        });
    }


    
   



    //====START SELECT CONTACT SECTION ====
        handleOpenSelectContactDialog = ()=>{
            const {contacts} = this.state;
            if(contacts.length < 1){
                this.handleOpenPopupDialog('No Contacts Found !'); 
                return;
            } 
            this.setState({openSelectContactDialog:true})
        }
        handleCloseSelectContactDialog = ()=>{
            this.setState({openSelectContactDialog:false})
            
        }
        handleSubmitSelectContact = (e)=>{
            e.preventDefault();

            const formData = new FormData(e.target);
            const arrContact = formData.getAll('contacts[]');

            this.setState({
                openSelectContactDialog:false,
                selectedContacts:arrContact
            },()=>this.handleUpdateContactsToMarketingToolStore())

        }
        handleCancelSelectContact = ()=>{
            this.setState({openSelectContactDialog:false})
        }

        handleSelectAllContact = ()=>{
            const {contacts,selectAllContacts} = this.state;
            var newContact = [];
            if(selectAllContacts == true){
                newContact = contacts.map(value=>{
                    return {...value,selected:false};
                });
            }else{
                newContact = contacts.map(value=>{
                    return {...value,selected:true};
                });
            }
            this.setState({
                selectAllContacts:!selectAllContacts,
                contacts:newContact
            });
        }
        handleOnChangeSelectContact = index =>{
            const {contacts} = this.state;
            if(contacts[index] != undefined){
                const newContact = contacts;
                newContact[index].selected =  !contacts[index].selected;
                console.log(newContact, contacts);
                // const setState = this.setState;

                const selectedAll = newContact.find(element => element.selected == false) ; // undefined = all selected
                const status = selectedAll == undefined ? true : false;

                console.log(selectedAll, status);
                this.setState({
                    contacts:newContact,
                    selectAllContacts: status 
                })
            }


        }

        handleRenderSelectContactDialog = ()=>{
            const {openSelectContactDialog, contacts,selectAllContacts, selectedContacts} = this.state;
            return(
                <>
                    <Dialog
                        disableBackdropClick
                        disableEscapeKeyDown={false}
                        maxWidth="lg"
                        // onEntering={handleEntering}
                        aria-labelledby="confirmation-dialog-title"
                        open={openSelectContactDialog}
                        // {...other}
                        >
                        <form ref={this.selectContactRef} onSubmit={this.handleSubmitSelectContact} id="select-contact-form">

                            <DialogTitle id="confirmation-dialog-title">
                                <FormGroup row>
                                    Select Contacts For Bulk Message
                                    
                                    <FormControlLabel
                                        control={
                                        <Checkbox
                                            checked={selectAllContacts}
                                            onChange={this.handleSelectAllContact}
                                            name="selectAll"
                                            color="primary"
                                            value={0}
                                            
                                        />
                                        }
                                        label={selectAllContacts == true ? ` Unselect All`:` Select All`}
                                    />
                                </FormGroup>

                            </DialogTitle>
                        
                            <DialogContent dividers>
                                    <FormGroup row>
                                        
                                        {
                                            contacts.map((value,index)=>{
                                                return (
                                                <MyCheckboxComponent 
                                                    {...value} key={index} index={index}
                                                    handleChange={this.handleOnChangeSelectContact}
                                                />);
                                            })
                                        }
                                        
                                    </FormGroup>

                            </DialogContent>
                            <DialogActions>
                                <Button type="button" autoFocus onClick={this.handleCancelSelectContact} color="primary">
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary">
                                    Ok
                                </Button>
                            </DialogActions>
                        </form>

                        </Dialog>
                </>
            );
        }


    //====END SELECT CONTACT SECTION ====


    //====START IMPORT CONTACT SECTION ====

        handleImportContact = ()=>{

            const jsonContact = this.refImportContactTextField.current.value;
            try {
                JSON.parse(jsonContact);
            } catch (e) {
                alert('Text is not JSON');

                return false;
            }

            this.handleCloseImportContactDialog(); 
            this.handleOpenPopupDialog('Import Contact is running, please wait!');

            const handleOpenPopupDialog = this.handleOpenPopupDialog;
            const handleClosePopupDialog = this.handleClosePopupDialog;

            //the json is ok
            TdLibController.importContact(jsonContact)
            .catch(err=>{
                handleClosePopupDialog();

                handleOpenPopupDialog('Falied !');
            })
            .then((res)=>{
                console.log('Marketing Tool: ', res);
                ContactController.importContactToBackend(res).then(res=>{
                    handleClosePopupDialog();
                    handleOpenPopupDialog('Process Completed !');

                });

            })
            
            

        }


        handleOpenImportContactDialog = ()=>{
            this.setState({openImportContactDialog:true});
        }
        handleCloseImportContactDialog = ()=>{
            this.setState({openImportContactDialog:false});
        }
        importContactDialogContent = ()=>{

            return(
                <>
                    <Dialog open={this.state.openImportContactDialog} onClose={this.handleCloseImportContactDialog} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Import Contact</DialogTitle>
                        <DialogContent>
                        <DialogContentText>
                            Upload Your Excel Contact File To <a href="http://beautifytools.com/excel-to-json-converter.php" target="_black">http://beautifytools.com/excel-to-json-converter.php</a>. Then Past The JSON Data Text Into Field Box. Excel's Cell Header Must Has "phone" (with country code), "first_name", "last_name".
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="json_contact"
                            label="JSON Contact"
                            type="text"
                            fullWidth
                            inputRef={this.refImportContactTextField}
                        />
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={this.handleCloseImportContactDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleImportContact} color="primary">
                            Submit
                        </Button>
                        </DialogActions>
                    </Dialog>
                </>
            );
        }

        handleClosePopupDialog=()=>{
            this.setState({openPopupDialog:false});
        }
        handleOpenPopupDialog=(message='')=>{
            this.setState({
                openPopupDialog:true,
                popupDialogMessage:message
            });
        }
        popupDialogContent = ()=>{
            var content = this.state.popupDialogMessage;
            return (
                <>
                    <Dialog
                        open={this.state.openPopupDialog}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={this.handleClosePopupDialog}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle id="alert-dialog-slide-title">{""}</DialogTitle>
                        <DialogContent>
                            {/* <DialogContentText id="alert-dialog-slide-description"> */}

                                <h3>{content}</h3>

                            {/* </DialogContentText> */}
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={this.handleClosePopupDialog} color="primary">
                            Okay
                        </Button>
                        
                        </DialogActions>
                    </Dialog>
                </>
            );
        }

    //====END IMPORT CONTACT SECTION ====



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
                    <div className="placeholder-wrapper" style={{width:'100%'}}><div className="placeholder-meta">Marketing Tool</div></div>
                </div>

                <button variant="contained" className="mg-b-5 btn my-custom-button" disabled={true} onClick={this.handleSelectGroup}> Select Group</button>
                <button variant="contained" className="mg-b-5 btn my-custom-button" onClick={this.handleOpenSelectContactDialog}> Select Contact</button>
                <button variant="contained" className="mg-b-5 btn my-custom-button" onClick={this.handleOpenImportContactDialog}> Import Contact</button>
                
                <br/>
                {this.importContactDialogContent()}
                {this.popupDialogContent()}

                {this.handleRenderSelectContactDialog()}
                
            </>
        );
    }
}

MarketingTool.propTypes = {
    popup: PropTypes.bool
};

export default MarketingTool;
