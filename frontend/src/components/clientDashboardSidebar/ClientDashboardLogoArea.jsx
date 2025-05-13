import React from 'react'

const ClientDashboardLogoArea = () => {
  return (
    <div>
         <div className="flex flex-row w-full align-items-center gap-4">
      <img
        src="/images/logo.png"
        alt="logo"
        height={40}
        width={40}
        className="flex"
      />
      <div className="flex flex-col overflow-hidden">
        <h3 className="mb-0 font-medium">Nuturemite</h3>
        <span className="text-xs text-gray-500">Customer Console</span>
      </div>
    </div>
    </div>
  )
}

export default ClientDashboardLogoArea