import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const EditProfile = (   ) => {
    const navigate=useNavigate()
    const [auth] = useAuth();
    const [name,setUserName]=useState("");
    const [email,setEmail]=useState("");
   const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  useEffect(()=>{
if(!auth.user){
    navigate('/login');
    return ;
  }else{
    
  }
  },[auth])
  

  return (
    <>
      <div>
        <input />
        <input/>
      </div>
    </>
  );
}

export default EditProfile;
