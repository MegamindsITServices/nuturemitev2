import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../utils/request'
import { ADMIN_PROTECTED } from '../lib/api-client'

const AdminProtectedRoute = () => {
  const [ok, setOk] = useState(true)
  const [loading, setLoading] = useState(true)
  const [auth] = useAuth()
  
  useEffect(() => {
    const authcheck = async () => {
      setLoading(true)
      try {
        // Check if user is admin
        const res = await axiosInstance.get('/api/auth/admin-auth', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
        
        if (res.data.ok) {
          setOk(true)
        } else {
          setOk(false)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setOk(false)
      } finally {
        setLoading(false)
      }
    }

    // Only check admin status if user is logged in
    if (auth.token && auth.user) {
      authcheck()
    } else {
      setLoading(false)
      setOk(false)
    }
  }, [auth.token, auth.user])

  if (loading) {
    return <div>Loading...</div>
  }

  return !loading && (ok ? <Outlet /> : <Navigate to="/unauthorized" replace />)
}

export default AdminProtectedRoute
