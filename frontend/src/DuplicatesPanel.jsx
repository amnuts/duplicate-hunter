import React, { useState, useEffect } from 'react';
import {useEventSubscription, useEventSubscriptionOnce} from "./CustomEventHooks.jsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Modal from "./Modal.jsx";

export default function DuplicatesPanel({ handleReset })
{
    const [isModalOpen, setIsModalOpen] = useState(true);
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
        setIsModalOpen(false);
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

    return (
        <>
            <PanelGroup autoSaveId="conditional" direction="horizontal">
                <Panel id="center" order={1}>
                    {!isModalOpen && (
                        <>
                            <button className="btn btn-primary" onClick={handleResetState}>reset</button>
                            {foundFilesCount > 0 && (
                                <div className="flex flex-col">
                                    <div className="flex flex-row items-center">
                                        <p className="text-2xl font-bold text-gray-800 flex-1">Duplicate files found</p>
                                        <span className="text-lg text-gray-600 flex-0">{foundFilesCount}</span>
                                    </div>
                                    <div className="flex flex-col overflow-auto">
                                        {Object.entries(foundFiles).map(([hash, files]) => (
                                            <div key={hash} className="flex flex-row items-center">
                                                <p className="text-sm text-gray-600 flex-1">{files[0].path}</p>
                                                <button className="text-sm text-gray-600 flex-0" onClick={() => handleShowHashMatches(hash)}>details</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {foundFilesCount === 0 && (
                                <p>No duplicates were found when scanning the {isProcessing.count} object{isProcessing.count === 1 ? '' : 's'}</p>
                            )}
                        </>
                    )}
                </Panel>
                {showHashMatches !== '' && (
                    <>
                        <PanelResizeHandle className="w-2 ml-2 mr-2 bg-blue-800" />
                        <Panel id="right" order={2}>
                            <button onClick={handleCloseDetails}>X</button>
                            {foundFiles.hasOwnProperty(showHashMatches) && foundFiles[showHashMatches].map((file, index) => (
                                <div key={index} className="flex flex-row items-center">
                                    <p className="text-sm text-gray-600 flex-1">{file.path}</p>
                                </div>
                            ))}
                        </Panel>
                    </>
                )}
            </PanelGroup>

            {isModalOpen && (<ShowModal {...isProcessing} />) || null}
        </>
    )
}

function ShowModal({ file, count })
{
    return (
        <Modal>
            <div className="flex flex-col items-center">
                <div className="loader"></div>
                <div className="modal-text p-6">searching for duplicate files</div>
                {file && (<div className="modal-text p-6">{file.path}</div>) || null}
                {count && (<div className="modal-text p-6">{count} processed</div>) || null}
            </div>
        </Modal>
    )
}
