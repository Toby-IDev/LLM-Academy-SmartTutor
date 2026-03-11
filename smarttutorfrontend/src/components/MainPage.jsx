import DropdownMenu from './DropdownMenu'
import { useState, useEffect } from "react";

const goBack = () => {
        setSelectedProject(null);
}

function MainPage({ projectName, goBack }) {

    return (
            <div className="flex flex-col h-full w-full">
                <button onClick={goBack} className="mb-4 px-3 py-1 bg-gray-200 rounded">
                    ← Back
                </button>
            </div>
    )
}

export default MainPage