import {useState} from 'react';

import {
    FindDuplicates,
    Reset
} from "../wailsjs/go/main/App.js";

import DirectoriesPanel from "./DirectoriesPanel.jsx";
import DuplicatesPanel from "./DuplicatesPanel.jsx";

function App() {
    const [showDirSelection, setShowDirSelection] = useState(true);

    const handleProceed = () => {
        setShowDirSelection(false);
        FindDuplicates();
    }

    const handleReset = () => {
        Reset();
        setShowDirSelection(true);
    }

    return (
        <div className="flex flex-col h-screen">
            <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                {showDirSelection && <DirectoriesPanel {...{handleProceed}} />}
                {!showDirSelection && <DuplicatesPanel {...{handleReset}} />}
            </main>
        </div>
    )
}

export default App
