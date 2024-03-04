import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Auth from "./pages/auth.jsx";
import Home from "./pages/home.jsx";
import PageNotFound from "./pages/404page.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/auth" element={<Auth/>}/>
                <Route path="*" element={<PageNotFound/>}/>
            </Routes>
        </BrowserRouter>
    )
}
