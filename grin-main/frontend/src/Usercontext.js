import React, { createContext, useContext, useState, useEffect } from 'react'
import tokenManager from './utils/tokenManager'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    // Initialize role from tokenManager
    const [role, setRole] = useState(() => tokenManager.getRole() || '')

    // Sync role to localStorage whenever it changes
    useEffect(() => {
        if (role) {
            localStorage.setItem("role", role)
        }
    }, [role])

    return (
        <UserContext.Provider value={{ role, setRole }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    return useContext(UserContext)
}