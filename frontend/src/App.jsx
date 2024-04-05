import React, {useEffect, useState} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Auth from "./pages/auth.jsx";
import Home from "./pages/home.jsx";
import PageNotFound from "./pages/404page.jsx";
import {Flex, Layout, Spin} from "antd";
import checkTokenValidity from "./utils/checkTokenValidity.js";
import axios from "axios";
import Service from "./pages/service.jsx";
import useWindowSize from "./utils/useWindowSize.js";
import Company from "./pages/company.jsx";
import {ThemeProvider, useThemeMode} from "antd-style";
import Settings from "./pages/settings.jsx";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [userData, setUserData] = useState({});

    const windowWidth = useWindowSize().width
    const isMobile = windowWidth < 992

    const {browserPrefers} = useThemeMode();

    useEffect(() => {
        if (localStorage.getItem('theme') === 'light') {
            document.body.style.backgroundColor = '#f5f5f5'
        } else if (localStorage.getItem('theme') === 'dark') {
            document.body.style.backgroundColor = '#000'
        } else {
            if (browserPrefers === 'light') {
                document.body.style.backgroundColor = '#f5f5f5'
            } else {
                document.body.style.backgroundColor = '#000'
            }
        }
    }, []);

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
            <Layout>
                <Flex justify="center" align="center" style={{width: '100%', height: '100vh'}}>
                    <Spin/>
                </Flex>
            </Layout>
        )
    }

    return (
        <ThemeProvider
            defaultThemeMode={localStorage.getItem('theme') ? localStorage.getItem('theme') : 'auto'}
            theme={(appearance) =>
                appearance === 'light'
                    ?
                    {
                        components: {
                            Layout: {headerBg: 'white'},
                            Table: {rowExpandedBg: '#f7fcff'},
                            Message: {contentBg: 'white'}
                        }
                    }
                    :
                    {
                        components: {
                            Layout: {headerBg: '#141414'},
                            Table: {rowExpandedBg: '#000c14'},
                            Message: {contentBg: '#000'}
                        }
                    }
            }
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Home userData={userData}/> : <Navigate to="/auth"/>}/>
                    <Route path="/settings"
                           element={isAuthenticated ? <Settings userData={userData}/> : <Navigate to="/auth"/>}/>
                    <Route path="/service/:serviceId" element={isAuthenticated ?
                        <Service userData={userData} isMobile={isMobile} windowWidth={windowWidth}/> :
                        <Navigate to="/auth"/>}/>
                    <Route path="/company/:companyId"
                           element={isAuthenticated ? <Company userData={userData}/> : <Navigate to="/auth"/>}/>
                    <Route path="/auth" element={isAuthenticated ? <Navigate to="/"/> : <Auth/>}/>
                    <Route path="*" element={<PageNotFound/>}/>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}
