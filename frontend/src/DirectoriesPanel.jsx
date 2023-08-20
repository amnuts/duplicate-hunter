import React, {useState} from 'react';
import {RemoveStartDirectory, SelectStartDirectories} from "../wailsjs/go/main/App.js";

export default function DirectoriesPanel({ handleProceed })
{
    const [startDirectories, setStartDirectories] = useState([]);

    const handleSelectStartDirectory = async (event) => {
        const dirs = (await SelectStartDirectories()).filter((str) => str && str !== '');
        setStartDirectories(dirs)
    };

    const handleRemoveStartDirectory = async (directoryToRemove) => {
        const dirs = await RemoveStartDirectory(directoryToRemove);
        setStartDirectories(dirs)
    };

    const handleStartFinding = () => {
        handleProceed({ startDirectories });
    }

    const generateStartDirectoryList = () => {
        if (!startDirectories.length) {
            return null;
        }
        return (
            <>
                <ul className="divide-y divide-gray-300 mt-3">
                    {startDirectories.map((directory) => (
                        <li className="flex items-center p-2 text-sm" key={directory}>
                            <p className="overflow-hidden whitespace-nowrap overflow-ellipsis flex-shrink-0 flex-grow mr-4 w-10 min-w-0 text-left" dir="rtl">{directory}</p>
                            <button className="ml-auto text-gray-600 hover:text-red-600" onClick={() => handleRemoveStartDirectory(directory)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick={handleStartFinding} className="inline-flex items-center px-3 py-2 bg-green-400 text-slate-900 rounded text-sm hover:bg-green-700 hover:text-white whitespace-nowrap mt-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
                    </svg>
                    Start finding
                </button>
            </>
        )
    }

    return (
        <>
            <div className="mb-6 border bg-white p-4 rounded-lg border-slate-300">
                <div className="flex items-center justify-between flex-col md:flex-row">
                    <div className="mr-4">
                        <h2 className="font-bold text-gray-400">Add a start directory</h2>
                        <p className="text-sm text-gray-400 mb-3">You can add one or more directories from where you want to source your images to organise.  The search will be recursive, so the list will only show the top-most path if you select a path lower down in the same folder.</p>
                    </div>
                    <button onClick={handleSelectStartDirectory} className="inline-flex items-center px-3 py-2 bg-green-400 text-slate-900 rounded text-sm hover:bg-green-700 hover:text-white whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
                        </svg>
                        Add start directory
                    </button>
                </div>
                {generateStartDirectoryList()}
            </div>
        </>
    );
}
