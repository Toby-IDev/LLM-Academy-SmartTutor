import { useState } from "react";

function DropdownMenu({ setView }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100 transition"
      >
        Menu
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
            Setting
          </button>

          <button
            onClick={() => {
              setView("customize");
              setOpen(false);
            }}
            className="px-4 py-2 hover:bg-gray-100 text-left"
          >
            Customize
          </button>

        </div>
      )}
    </div>
  );
}

export default DropdownMenu;