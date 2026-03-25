import DropdownMenu from './components/DropdownMenu'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainPage from './components/MainPage';
import Setting from './components/Setting';
import Customize from './components/Customize';
import Testing from './components/Testing';


function App() {

  const [selectedProject, setSelectedProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState("home");
  const [questions, setQuestions] = useState([]);


  const colors = [
    "bg-red-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-pink-200"
  ];



  const getColor = (name) => {
    const index = name.length % colors.length;
    return colors[index];
  };

  const fetchProjects = async () => {
    const res = await fetch("http://localhost:1888/api/getprojects");
    const data = await res.json();
    setProjects(data.projects || []);
  };

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
      setOpen(false);
      setProjectName("");
      fetchProjects();
    } catch (err) {
      console.error("Create project failed:", err.message);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);


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
            <button
              onClick={() => setView("setting")}
              className="px-3 py-1 text-semibold rounded-full border border-gray-500 hover:bg-gray-100 transition"
            >
              Setting
            </button>

            <button
              onClick={() => setView("customize")}
              className="px-3 py-1 text-semibold rounded-full border border-gray-500 hover:bg-gray-100 transition"
            >
              Customize
            </button>
          </div>

          <div className="sm:hidden">
            <DropdownMenu setView={setView} />
          </div>
        </div>

      </div>

      <div className="content flex-1 bg-gray-100 p-6 flex flex-wrap gap-6 justify-center items-start">
        {view === "setting" ? (
          <Setting />
        ) : view === "customize" ? (
          <Customize />
        ) : view === "testing" ? (
          <Testing
            projectName={selectedProject}
            setView={setView}
          />
        ) : selectedProject ? (
          <MainPage
            projectName={selectedProject}
            goBack={() => setSelectedProject(null)}
            setView={setView}
          />
        ) : (
          <>
            {projects.map((project) => (
              <div
                key={project.name}
                onClick={() => setSelectedProject(project.name)}
                className="w-64 h-40 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
              >
                <div className={`h-20 ${getColor(project.name)}`}></div>
                <div className="flex flex-col justify-center px-4 py-3 text-left flex-1">
                  <div className="text-md font-semibold text-gray-800">{project.name}</div>
                  <div className="text-sm text-gray-500">{project.fileCount} files</div>
                </div>
              </div>
            ))}

            <div
              onClick={() => setOpen(true)}
              className="w-64 h-40 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="text-4xl text-gray-500">+</div>
              <div className="text-gray-600 mt-2">Create Project</div>
            </div>
          </>
        )}

        {open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">New Project</h2>
              <input
                type="text"
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-lg border">
                  Cancel
                </button>
                <button onClick={createProject} className="px-3 py-1 rounded-lg bg-blue-500 text-white">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
