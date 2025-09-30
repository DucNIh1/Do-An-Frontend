const Footer = () => {
  return (
    <footer
      className="relative bg-[#0d4e96] text-white"
      style={{
        background: `url("/footer_bg.png") #0d4e96 no-repeat center/cover`,
      }}
    >
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <img
              src="/logo/logo_footer.svg"
              alt="HaUI logo"
              className="w-36 mb-4"
            />
            <p className="mb-2 font-semibold text-white">
              Đơn vị Lao động Anh hùng thời kỳ đổi mới
            </p>
            <p className="text-sm text-gray-200 leading-relaxed">
              Chất lượng – Sáng tạo – Đoàn kết – Phát triển
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-3 uppercase tracking-wide text-white">
              Cơ sở chính
            </h4>
            <p className="text-sm text-gray-200 leading-relaxed">
              📍 Số 298 đường Cầu Diễn, Quận Bắc Từ Liêm, Hà Nội <br />
              ☎️ 0243.7655.121 – 08.3456.0255 <br />
              📧 tuyensinh@haui.edu.vn <br />
              🌐 tuyensinh.haui.edu.vn
            </p>

            <h4 className="text-lg font-bold mt-6 mb-3 uppercase tracking-wide text-white">
              Các cơ sở khác
            </h4>
            <p className="text-sm text-gray-200 leading-relaxed">
              📍 Cơ sở 2: Phường Tây Tựu, quận Bắc Từ Liêm, Hà Nội <br />
              📍 Cơ sở 3: Phường Lê Hồng Phong, TP Phủ Lý, tỉnh Hà Nam
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-3 uppercase tracking-wide text-white">
              Liên kết website
            </h4>
            <ul className="text-sm space-y-2">
              {[
                "Trường Đại học Công nghiệp Hà Nội",
                "Cổng thông tin đào tạo",
                "Đào tạo trực tuyến",
                "Hành chính điện tử",
                "Thông tin tuyển sinh",
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="hover:underline text-gray-200 hover:text-yellow-300 transition"
                  >
                    » {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/30 pt-4 text-center text-xs md:text-sm text-gray-300">
          Copyright © {new Date().getFullYear()} Hanoi University of Industry
        </div>
      </div>
    </footer>
  );
};

export default Footer;
