import DropdownMenu from './components/DropdownMenu'
import { useState, useEffect } from "react";
import MainPage from './components/MainPage';
import Setting from './components/Setting';
import Testing from './components/Testing';
import WrongQuestionBook from './components/WrongQuestionBook';
import FAQ from './components/FAQ.jsx';


function App() {

  const [selectedProject, setSelectedProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState("home");
  const [wrongQuestionsGlobal, setWrongQuestionsGlobal] = useState([]);

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



  const deleteProject = async (name) => {
    if (!window.confirm(`确定要删除项目 "${name}" 吗？此操作不可撤销！`)) return;
    try {
      const res = await fetch("http://localhost:1888/api/deleteProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: name }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("返回不是 JSON:", text);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.name !== name));
        if (selectedProject === name) {
          setSelectedProject(null);
          setView("home");
        }
      } else {
        console.error("删除失败:", data);
      }
    } catch (err) {
      console.error("删除项目请求失败:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);


  return (
    <div className="flex flex-col h-screen bg-gray-100">

      <div className="header h-25 shrink-0 flex items-center px-6 text-black">

        <div className="flex items-center gap-3" onClick={() => { setSelectedProject(null); setView("home") }}>
          <img
            src="/src/assets/logo.png"
            alt="Logo"
            className="w-15"
          />

          <h1 className="text-lg font-semibold">
            LLM-academy
          </h1>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => setView("setting")}
              className="px-4 py-2 text-white font-semibold bg-gradient-to-r from-gray-800 to-black rounded-full shadow-md hover:shadow-lg hover:scale-105 transition transform duration-200 border border-gray-700"
            >
              Setting 设置
            </button>
            <button
              onClick={() => setView("wrongquestionsbook")}
              className="px-4 py-2 text-white font-semibold bg-gradient-to-r from-gray-800 to-black rounded-full shadow-md hover:shadow-lg hover:scale-105 transition transform duration-200 border border-gray-700"
            >
              错题本
            </button>
             <button
              onClick={() => setView("faq")}
              className="px-4 py-2 text-white font-semibold bg-gradient-to-r from-gray-800 to-black rounded-full shadow-md hover:shadow-lg hover:scale-105 transition transform duration-200 border border-gray-700"
            >
              FAQ用户支持
            </button>
          </div>

          <div className="sm:hidden">
            <DropdownMenu setView={setView} />
          </div>
        </div>

      </div>

      <div className="content flex-1 bg-gray-100 p-6 flex flex-wrap gap-6 justify-center items-start h-full">
        {view === "setting" ? (
          <Setting
            setView={setView} />
        ) : view === "wrongquestionsbook" ? (
          <WrongQuestionBook
            goBack={() => { setSelectedProject(null); setView("home") }}
            setView={setView}
            wrongQuestionsGlobal={wrongQuestionsGlobal} />
        ) : view === "testing" ? (
          <Testing
            projectName={selectedProject}
            setWrongQuestionsGlobal={setWrongQuestionsGlobal}
            goBack={() => { setSelectedProject(null); setView("home") }}
            setView={setView}
          />
        ) : view === "faq" ? (
          <FAQ>
            goBack={() => { setSelectedProject(null); setView("home") }}
            setView={setView}
          </FAQ>
        ): selectedProject ? (
          <MainPage
            projectName={selectedProject}
            goBack={() => { setSelectedProject(null); setView("home") }}
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

                <div className="flex flex-col justify-center px-4 py-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-md font-semibold text-gray-800">{project.name}</div>
                      <div className="text-sm text-gray-500">{project.fileCount} files</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.name);
                      }}
                      className="w-15 h-8 text-sm font-semibold flex items-center justify-center rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                    >
                      删除
                    </button>
                  </div>
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
