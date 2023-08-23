import React, {useState} from 'react';
import {RemoveStartDirectory, SelectStartDirectories} from "../wailsjs/go/main/App.js";
import { FolderPlusIcon, MagnifyingGlassIcon, FolderMinusIcon } from '@heroicons/react/24/outline';

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
                        <li className="flex items-center p-2 text-sm border-b border-purple-200" key={directory}>
                            <p className="overflow-hidden whitespace-nowrap overflow-ellipsis flex-shrink-0 flex-grow mr-4 w-10 min-w-0 text-left" dir="rtl">{directory}</p>
                            <button className="ml-auto text-gray-600 hover:text-red-600" onClick={() => handleRemoveStartDirectory(directory)}>
                                <FolderMinusIcon className="w-5 h-5 ml-2" />
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick={handleStartFinding} className="inline-flex items-center mt-6 px-3 py-2 bg-purple-400 text-white rounded text-sm hover:bg-purple-700 hover:text-white whitespace-nowrap">
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    Start finding
                </button>
            </>
        )
    }

    return (
        <div className="rounded-lg bg-neutral-50 p-6 m-6">
            <div className="mr-4">
                <h2 className="font-bold text-slate-800">Add a start directory</h2>
                <p className="text-sm text-slate-600 mb-3">You can add one or more directories where you want top look for duplicate files.  The search will be recursive, so the list will only show the top-most path if you select a path lower down in the same folder.</p>
            </div>
            <button onClick={handleSelectStartDirectory} className="inline-flex items-center px-3 py-2 bg-purple-400 text-white rounded text-sm hover:bg-purple-700 hover:text-white whitespace-nowrap">
                <FolderPlusIcon className="w-5 h-5 mr-2" />
                Add start directory
            </button>
            {generateStartDirectoryList()}
        </div>
    );
}
