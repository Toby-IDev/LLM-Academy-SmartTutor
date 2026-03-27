import { useState } from "react";

function DropdownMenu({ setView }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 text-white font-semibold bg-gradient-to-r from-gray-800 to-black rounded-full shadow-md hover:shadow-lg hover:scale-105 transition transform duration-200 border border-gray-700"
      >
        Menu菜单
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">

          <button
            onClick={() => {
              setView("setting");
              setOpen(false);
            }}
            className="px-4 py-2 hover:bg-gray-100 text-left"
          >
            Setting设置
          </button>

          <button
            onClick={() => {
              setView("wrongquestionsbook");
              setOpen(false);
            }}
            className="px-4 py-2 hover:bg-gray-100 text-left"
          >
            错题本
          </button>
          <button
            onClick={() => {
              setView("faq");
              setOpen(false);
            }}
            className="px-4 py-2 hover:bg-gray-100 text-left"
          >
            错题本
          </button>

        </div>
      )}
    </div>
  );
}

export default DropdownMenu;