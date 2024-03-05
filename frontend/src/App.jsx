import React, {useEffect, useState} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Auth from "./pages/auth.jsx";
import Home from "./pages/home.jsx";
import PageNotFound from "./pages/404page.jsx";
import {Flex, Spin} from "antd";

export default function App() {
    const apiUrl = import.meta.env.VITE_API_URL

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [userData, setUserData] = useState({});

    const checkTokenValidity = async () => {
        try {
            const response = await fetch(apiUrl + '/auth/info', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                setIsAuthenticated(true);
                const data = await response.json();
                setUserData(data);
            } else {
                // Если токен просрочен, попытка обновить его
                const refreshResponse = await fetch(apiUrl + '/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({refreshToken: localStorage.getItem('refreshToken')}),
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('refreshToken', data.refresh_token);
                    await checkTokenValidity();
                } else {
                    throw new Error('Не удалось обновить токен');
                }
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    useEffect(() => {
        checkTokenValidity();
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
                <Route path="/auth" element={isAuthenticated ? <Navigate to="/"/> : <Auth/>}/>
                <Route path="*" element={<PageNotFound/>}/>
            </Routes>
        </BrowserRouter>
    )
}
