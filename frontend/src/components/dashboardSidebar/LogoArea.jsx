import React from "react";
import { useNavigate } from "react-router-dom";
export function LogoArea() {
  const navigate=useNavigate();
  return (
    <div className="flex flex-row w-full align-items-center gap-4 cursor-pointer" onClick={()=>{navigate('/')}}>
      <img
        src="/images/logo.png"
        alt="logo"
        height={40}
        width={40}
        className="flex"
      />
      <div className="flex flex-col overflow-hidden">
        <h3 className="mb-0 font-medium">Nuturemite</h3>
        {/* <span className="text-xs text-gray-500">Admin Console</span> */}
      </div>
    </div>
  );
}
