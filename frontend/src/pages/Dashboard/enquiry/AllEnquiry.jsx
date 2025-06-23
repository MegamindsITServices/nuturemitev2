import React, { useEffect, useState } from 'react';
import {toast} from 'sonner';
import { axiosInstance } from '../../../utils/request';

const AllEnquiry = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get("/api/user/enquiry/getMsg");
                
                if (response.data.status) {
                    setMessages(response.data.msg);
                } else {
                    toast.error("Failed to fetch messages.");
                }
                
                setLoading(false);
            } catch (err) {
                setLoading(false);
                toast.error(err.message || "Something went wrong.");
            }
        };
        
        fetchMessages();
    }, []);
if(loading){
     return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
}
    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-10">
         
                <div>
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Enquiry Messages</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {messages.length > 0 ? (
                            messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                                >
                                    <h2 className="text-lg font-semibold text-gray-900">{msg.name}</h2>
                                    <p className="text-sm text-gray-600">{msg.email}</p>
                                    <p className="mt-4 text-gray-700">{msg.message}</p>
                                    <div className="mt-4 flex justify-end">
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&to=${msg.email}`}
                                            target='_blank'
                                            rel="noopener noreferrer"
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                            Reply
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 col-span-3">No messages found.</p>
                        )}
                    </div>
                </div>
           
        </div>
    );
};

export default AllEnquiry;