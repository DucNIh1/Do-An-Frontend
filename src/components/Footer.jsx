const Footer = () => {
  return (
    <footer
      className="bg-[#0d4e96] text-white py-10 px-6"
      style={{
        background: `url(${"/footer_bg.png"}) #0d4e96 no-repeat center`,
      }}
    >
      <div className="px-10 mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <img
            src="/logo/logo_footer.svg"
            alt="HaUI logo"
            className="w-40 mb-4"
          />
          <p className="mb-2 font-semibold">
            Đơn vị Lao động Anh hùng thời kỳ đổi mới
          </p>
          <p className="text-sm">
            Chất lượng – Sáng tạo – Đoàn kết – Phát triển
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-3">CƠ SỞ CHÍNH</h4>
          <p className="text-sm">
            📍 Số 298 đường Cầu Diễn, Quận Bắc Từ Liêm, Hà Nội
            <br />
            ☎️ 0243.7655.121 – 08.3456.0255
            <br />
            📧 tuyensinh@haui.edu.vn
            <br />
            🌐 tuyensinh.haui.edu.vn
          </p>
          <h4 className="text-xl font-bold mt-6 mb-3">CÁC CƠ SỞ KHÁC</h4>
          <p className="text-sm">
            📍 Cơ sở 2: Phường Tây Tựu, quận Bắc Từ Liêm, Hà Nội
            <br />
            📍 Cơ sở 3: Phường Lê Hồng Phong, TP Phủ Lý, tỉnh Hà Nam
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-3">LIÊN KẾT WEBSITE</h4>
          <ul className="text-sm space-y-2">
            <li>
              <a href="#" className="hover:underline">
                » Trường Đại học Công nghiệp Hà Nội
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                » Cổng thông tin đào tạo
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                » Đào tạo trực tuyến
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                » Hành chính điện tử
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                » Thông tin tuyển sinh
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-white/30 pt-4 text-center text-sm">
        Copyright © {new Date().getFullYear()} Hanoi University of Industry
      </div>
    </footer>
  );
};

export default Footer;
