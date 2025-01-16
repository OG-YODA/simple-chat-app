import React, { useState, useContext } from 'react'; 
import CustomNotification from '../components/CustomNotification'; 
import AuthContext from '../context/AuthContext'; 
import '../styles/settings.css';

function Settings() {
    const { isAuthenticated, logout } = useContext(AuthContext);

    return (
        <div class="content">
            {isAuthenticated ? (
            <>
                <ul>
                    <li></li>
                </ul>
            </>
            ) :(
            <>
                <div class="banner">
                    <h1>You are not authorized to see this page!</h1>
                </div>
            </>
            )}
        </div>
    );
}

export default Settings;