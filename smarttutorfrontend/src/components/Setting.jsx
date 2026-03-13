import { useState } from 'react'


function Setting() {


    const [api, setAPI] = useState("");

    const sendToBackend = async () => {
        await fetch("http://localhost:1888/api/getAPI", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                value: api
            })
        });
    };



    return (
        <div className="Setting">
            <div className='flex flex-row gap-4 p-4 justify-start items-center'>
                <h1>Your API: </h1>
                <input
                    type="text"
                    placeholder="Enter your API key" name="apiKey" onChange={(e)=>setAPI(e.target.value)}></input>
                <button className="px-4 py-2 text-white text-sm border border-gray-300 bg-black rounded-xl hover:bg-gray-800 transition" onClick={sendToBackend}>save</button>
            </div>
        </div>
    )
}

export default Setting