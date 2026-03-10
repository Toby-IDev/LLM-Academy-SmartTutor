import DropdownMenu from './components/DropdownMenu'
import { useState } from "react";


function App() {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const createProject = async () => {
  if (!projectName) return;

  try {
    const res = await fetch(
      `http://localhost:1888/api/createproject?projectName=${encodeURIComponent(projectName)}`
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    console.log(data);
    setOpen(false);
    setProjectName("");
  } catch (err) {
    console.error("Create project failed:", err.message);
  }
};

  return (

    <div className="flex flex-col h-screen bg-[var(--color-cream)]">

      <div className="header h-25 flex items-center px-6 text-black">

        <div className="flex items-center gap-3">
          <img
            src="/src/assets/logo.png"
            alt="Logo"
            className="w-15"
          />

          <h1 className="text-lg font-semibold">
            GPT-academy
          </h1>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex gap-2">
            <button className="px-3 py-1 text-semibold rounded-full border border-gray-500 hover:bg-gray-100 transition">
              Setting
            </button>
            <button className="px-3 py-1 text-semibold rounded-full border border-gray-500 hover:bg-gray-100 transition">
              Customize
            </button>
          </div>

          <div className="sm:hidden">
            <DropdownMenu />
          </div>
        </div>

      </div>

      <div className="content flex-1 bg-gray-100 p-6 flex items-center justify-center">

        <div
          onClick={() => setOpen(true)}
          className="w-64 h-40 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="text-4xl text-gray-500">+</div>
          <div className="text-gray-600 mt-2">Create Project</div>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

            <div className="bg-white p-6 rounded-xl w-80 shadow-lg">

              <h2 className="text-lg font-semibold mb-4">
                New Project
              </h2>

              <input
                type="text"
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              />

              <div className="flex justify-end gap-2">

                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 rounded-lg border"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    createProject();
                    console.log(projectName);
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-500 text-white"
                >
                  Create
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}

export default App
