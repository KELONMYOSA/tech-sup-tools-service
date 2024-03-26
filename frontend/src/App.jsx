import React, {useEffect, useState} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Auth from "./pages/auth.jsx";
import Home from "./pages/home.jsx";
import PageNotFound from "./pages/404page.jsx";
import {Flex, Spin} from "antd";
import checkTokenValidity from "./utils/checkTokenValidity.js";
import axios from "axios";
import Service from "./pages/service.jsx";
import useWindowSize from "./utils/useWindowSize.js";
import Company from "./pages/company.jsx";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [userData, setUserData] = useState({});

    const windowWidth = useWindowSize().width
    const isMobile = windowWidth < 992

    axios.interceptors.request.use(async (config) => {
        config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    axios.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                await checkTokenValidity();

                axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

                return axios(originalRequest);
            }
            return Promise.reject(error);
        }
    )

    const checkToken = async () => {
        const checkData = await checkTokenValidity();
        setIsAuthenticated(checkData[0])
        setUserData(checkData[1])
        setIsCheckingAuth(false)
    }

    useEffect(() => {
        checkToken();
    }, []);

    if (isCheckingAuth) {
        return (
            <Flex justify="center" align="center" style={{width: '100%', height: '100vh'}}>
                <Spin/>
            </Flex>
        )
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={isAuthenticated ? <Home userData={userData}/> : <Navigate to="/auth"/>}/>
                <Route path="/service/:serviceId" element={isAuthenticated ? <Service userData={userData} isMobile={isMobile} windowWidth={windowWidth}/> : <Navigate to="/auth"/>}/>
                <Route path="/company/:companyId" element={isAuthenticated ? <Company userData={userData} isMobile={isMobile}/> : <Navigate to="/auth"/>}/>
                <Route path="/auth" element={isAuthenticated ? <Navigate to="/"/> : <Auth/>}/>
                <Route path="*" element={<PageNotFound/>}/>
            </Routes>
        </BrowserRouter>
    )
}
