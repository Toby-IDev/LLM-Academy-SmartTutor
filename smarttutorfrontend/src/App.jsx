import DropdownMenu from './components/DropdownMenu'

function App() {
  return (
    <div className="flex flex-col h-screen bg-beige-500">

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

      <div className="content flex-1 bg-gray-100 p-6">

        
      </div>

    </div>
  )
}

export default App
