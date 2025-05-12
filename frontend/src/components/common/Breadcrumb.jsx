import React from 'react'

const Breadcrumb = ({items}) => {
  return (
    <div className="flex items-center text-sm mb-6">
    {items.map((item, index) => (
      <div key={index} className="flex items-center">
        {index > 0 && <span className="mx-2 text-gray-400">/</span>}
        {item.href ? (
          <a href={item.href} className="text-gray-600 hover:text-gray-900">
            {item.label}
          </a>
        ) : (
          <span className="text-gray-900">{item.label}</span>
        )}
      </div>
    ))}
  </div>
  )
}

export default Breadcrumb