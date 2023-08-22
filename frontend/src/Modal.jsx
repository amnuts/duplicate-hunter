import React from 'react';

const Modal = ({ children}) => {
    return (
        <div className="fixed z-10 inset-0 h-full w-full m-10">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 transition-opacity">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="bg-white rounded-lg p-6 z-20 text-center">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
