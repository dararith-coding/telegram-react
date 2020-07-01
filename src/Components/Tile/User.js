/*
*license
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import UserTile from './UserTile';
import UserStatus from './UserStatus';
import { getUserFullName } from '../../Utils/User';
import UserStore from './../../Stores/UserStore';
import './User.css';

class User extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: UserStore.get(props.userId)
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.userId !== this.props.userId;
    }

    handleClick = () => {
        const { userId, onSelect } = this.props;
        if (!onSelect) return;

        onSelect(userId);
    };

    render() {
        const { userId, t, showStatus } = this.props;

        const fullName = getUserFullName(userId, null, t);

        const user = UserStore.get(userId);
        const { is_contact, username } = user;

        return (
            <div className='user' onClick={this.handleClick}>
                <div className='user-wrapper'>
                    <UserTile userId={userId} />
                    <div className='user-inner-wrapper'>
                        <div className='tile-first-row'>
                            <div className='user-title'>{fullName}</div>
                        </div>
                        {showStatus && (
                            <div className='tile-second-row'>
                                {!is_contact && username ? <div className='user-content dialog-content'>{'@' + username}</div> : <UserStatus userId={userId} /> }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

User.propTypes = {
    userId: PropTypes.number.isRequired,
    onSelect: PropTypes.func,
    showStatus: PropTypes.bool
};

User.defaultProps = {
    showStatus: true
};

export default withTranslation()(User);
