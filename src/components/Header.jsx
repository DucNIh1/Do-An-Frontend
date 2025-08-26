const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 p-5 z-[999] shadow-lg  h-20 bg-white">
      <div className="flex justify-between items-center">
        <img
          src="/logo/logo.svg"
          alt="Logo cổng thông tin tuyển sinh"
          className="w-[300px]"
        />
        <nav className="flex items-center justify-center gap-8">
          <ul className="flex items-center gap-5 text-sm">
            <li className="relative group cursor-pointer hover:text-deepBlue">
              <span className="text-sm">Trang chủ</span>
              <span className="absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100"></span>
            </li>
            <li className="relative group cursor-pointer hover:text-deepBlue">
              <span className="text-sm">Tư vấn hỏi đáp</span>
              <span className="absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100"></span>
            </li>
            <li className="relative group cursor-pointer hover:text-deepBlue">
              <span className="text-sm">Bài đăng</span>
              <span className="absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100"></span>
            </li>
          </ul>
          <button className="bg-deepBlue px-4 py-2 rounded-3xl text-white text-sm font-medium hover:opacity-90 transition-all duration-150">
            Tư vấn xét tuyển
          </button>
          <div className="flex gap-2">
            <img src="/logo/vn.webp" alt="" className="w-10" />
            <img src="/logo/en.webp" alt="" className="w-10" />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
