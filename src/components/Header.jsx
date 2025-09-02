import { NavLink } from "react-router";
import { useState } from "react";
import { MdMenu } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Tư vấn hỏi đáp", path: "/tu-van-hoi-dap" },
    { name: "Bài đăng", path: "/posts" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 p-4 z-[999] shadow-lg h-20 bg-white">
      <div className="flex justify-between items-center h-full">
        <img
          src="/logo/logo.svg"
          alt="Logo cổng thông tin tuyển sinh"
          className="w-[220px] sm:w-[300px]"
        />

        <nav className="hidden md:flex items-center justify-center gap-8">
          <ul className="flex items-center gap-5 text-sm">
            {navLinks.map((link) => (
              <li key={link.path} className="relative group cursor-pointer">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm transition-colors ${
                      isActive
                        ? "text-deepBlue font-medium"
                        : "text-gray-700 hover:text-deepBlue"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
                <span
                  className={`
                    absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-current transition-transform duration-300 
                    group-hover:scale-x-100
                  `}
                />
              </li>
            ))}
          </ul>

          <button className="bg-deepBlue px-4 py-2 rounded-3xl text-white text-sm font-medium hover:opacity-90 transition-all duration-150">
            Tư vấn xét tuyển
          </button>

          <div className="flex gap-2">
            <img src="/logo/vn.webp" alt="VN" className="w-8 sm:w-10" />
            <img src="/logo/en.webp" alt="EN" className="w-8 sm:w-10" />
          </div>
        </nav>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <IoMdClose className="w-6 h-6" />
          ) : (
            <MdMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-lg border-t mt-2 rounded-lg">
          <ul className="flex flex-col gap-3 p-4 text-sm">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 ${
                      isActive
                        ? "text-deepBlue font-medium"
                        : "text-gray-700 hover:text-deepBlue"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
            <li>
              <button className="w-full bg-deepBlue px-4 py-2 rounded-3xl text-white text-sm font-medium hover:opacity-90 transition-all">
                Tư vấn xét tuyển
              </button>
            </li>
            <li className="flex gap-3">
              <img src="/logo/vn.webp" alt="VN" className="w-8" />
              <img src="/logo/en.webp" alt="EN" className="w-8" />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
