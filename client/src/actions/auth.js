import axios from 'axios';
import { setAlert } from './alert';
import {
    REGISTER_SUCCESS, 
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    CLEAR_PROFILE,
}  from '../actions/types';
import setAuthToken from '../utils/setAuthToken';

//Load user
export const loadUser = () => async dispatch => {
    if(localStorage.token){
        setAuthToken(localStorage.token);
    }
    
    try {
        const res = await axios.get("/api/auth"); 
        dispatch({
            type : USER_LOADED,
            payload : res.data,
        })
    } catch (error) {
        dispatch({
            type : AUTH_ERROR,
        });
    }
}

//Register user
export const register = ({ name, email, password }) => async dispatch =>{
    try {
        const newUser = {
            name : name,
            email : email,
            password : password
        };
        const config = {
            headers : {
               "Content-Type" : "application/json",
            }
        };
        const body = JSON.stringify(newUser);

        const res = await axios.post("/api/users/registerUser",body,config);
        
        dispatch({
            type : REGISTER_SUCCESS,
            payload : res.data
        });
        
        dispatch(loadUser());

    } catch (error) {
        const errors = error.response.data.errors;
        if(errors){
            errors.forEach(err => dispatch(setAlert(err.msg,"danger")));
        }
        dispatch({
            type : REGISTER_FAIL,
        });
    }
};

//login User
export const login = ( email, password ) => async dispatch =>{
    try {
        const loginUser = {
            email : email,
            password : password
        };
        const config = {
            headers : {
               "Content-Type" : "application/json",
            }
        };
        const body = JSON.stringify(loginUser);

        const res = await axios.post("/api/auth/Login",body,config);
    
        dispatch({
            type : LOGIN_SUCCESS,
            payload : res.data
        });

        dispatch(loadUser());

    } catch (error) {
        const errors = error.response.data.errors;
        if(errors){
            errors.forEach(err => dispatch(setAlert(err.msg,"danger")));
        }
        dispatch({
            type : LOGIN_FAIL,
        });
    }
}

//Logout user
export const logout = () => dispatch => {
    dispatch({
        type : CLEAR_PROFILE 
    });
    dispatch({
        type : LOGOUT 
    });
}