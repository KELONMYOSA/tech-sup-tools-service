import React, {useEffect, useState} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Auth from "./pages/auth.jsx";
import Home from "./pages/home.jsx";
import PageNotFound from "./pages/404page.jsx";
import {Flex, Spin} from "antd";
import checkTokenValidity from "./utils/checkTokenValidity.js";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [userData, setUserData] = useState({});

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
                <Route path="/auth" element={isAuthenticated ? <Navigate to="/"/> : <Auth/>}/>
                <Route path="*" element={<PageNotFound/>}/>
            </Routes>
        </BrowserRouter>
    )
}