import React, { useState, useEffect } from 'react';
import {useEventSubscription, useEventSubscriptionOnce} from "./CustomEventHooks.jsx";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "./ResizeHandle.jsx"
import { ArrowPathIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function DuplicatesPanel({ handleReset })
{
    const [isSearching, setIsSearching] = useState(true);
    const [foundFiles, setFoundFiles] = useState([]);
    const [foundFilesCount, setFoundFilesCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showHashMatches, setShowHashMatches] = useState('');

    useEffect(() => {
        setFoundFilesCount(Object.keys(foundFiles).length);
    }, [foundFiles]);

    const handleEventFinding = (data) => {
        setIsProcessing(data);
    };

    const handeEventFindingComplete = (data) => {
        setIsSearching(false);
        setFoundFiles(data);
    }

    const handleShowHashMatches = (hash) => {
        setShowHashMatches(hash);
    }

    const handleCloseDetails = () => {
        setShowHashMatches('');
    }

    const handleResetState = () => {
        setFoundFiles([]);
        setFoundFilesCount(0);
        setIsProcessing(false);
        setShowHashMatches('');
        handleReset();
    }

    useEventSubscription('finding-duplicates', handleEventFinding);
    useEventSubscriptionOnce('finding-complete', handeEventFindingComplete);

    if (isSearching) {
        return (
            <div className="flex flex-col flex-1 items-center text-sm m-6 p-6 justify-center">
                <div className="loader"></div>
                <div className="modal-text mt-4">searching for duplicate files</div>
                {isProcessing.hasOwnProperty('file') && (<div className="modal-text text-xs py-4">{isProcessing.file.path}</div>) || null}
                {isProcessing.hasOwnProperty('count') && (<div className="modal-text">{isProcessing.count} processed</div>) || null}
            </div>
        )
    }

    if (foundFilesCount === 0) {
        return (
            <div className="rounded-lg bg-neutral-50 p-6 m-6">
                <p>No duplicates were found when scanning the {isProcessing.count} object{isProcessing.count === 1 ? '' : 's'}</p>
            </div>
        )
    }

    return (
        <div className="m-6 flex flex-col flex-1">
            <button className="rounded bg-purple-600 text-white px-2 py-1 text-sm flex self-start" onClick={handleResetState}>
                <ArrowPathIcon className="w-4 h-4 mr-1 flex-1"/>
                <span className="flex-1">reset</span>
            </button>
            <div className="flex flex-row my-3">
                <p className="text-2xl font-bold text-gray-800 flex-1">Items with duplicates</p>
                <span className="text-2xl font-bold text-gray-600 flex-0">{foundFilesCount}</span>
            </div>
            <PanelGroup autoSaveId="conditional" direction="horizontal" classNAme="flex">
                <Panel id="main" order={1}>
                    <div className="p-6 rounded-lg bg-neutral-50 overflow-auto text-xs flex flex-col flex-1">
                        {Object.entries(foundFiles).map(([hash, files]) => (
                            <div key={hash} className="flex flex-row items-center">
                                <p className="text-gray-600 flex-1">{files[0].path}</p>
                                <button className="text-gray-600 flex-0" onClick={() => handleShowHashMatches(hash)}>details</button>
                            </div>
                        ))}
                    </div>
                </Panel>
                {showHashMatches !== '' && (
                    <>
                        <ResizeHandle className="mx-1" />
                        <Panel id="meta" order={2} className="flex">
                            <div className="p-6 rounded-lg bg-neutral-50 overflow-auto text-xs flex flex-col flex-1">
                                <XCircleIcon className="w-5 h-5 text-slate-400 hover:text-purple-600 self-end hover:cursor-pointer relative left-4 bottom-3" onClick={handleCloseDetails} />
                                {foundFiles.hasOwnProperty(showHashMatches) && foundFiles[showHashMatches].map((file, index) => (
                                    <div key={index} className="flex flex-row items-center">
                                        <p className="text-sm text-gray-600 flex-1">{file.path}</p>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </>
                )}
            </PanelGroup>
        </div>
    )
}
