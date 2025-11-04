BÀI TẬP TUẦN 7 - REACT

Sinh viên: Phùng Minh Vũ - 20235252


COMPONENT QUẢN LÝ STATE

Component App.jsx là component chính, quản lý toàn bộ state của ứng dụng bao gồm:
- studentId: Mã sinh viên cần tra cứu
- isLoading: Trạng thái đang tải dữ liệu
- error: Thông báo lỗi nếu có
- results: Kết quả tra cứu (thông tin sinh viên + điểm số)
- sinhvienData, hocphanData, ketquaData: Dữ liệu từ các file JSON


KHI NÀO useEffect ĐƯỢC KÍCH HOẠT

useEffect thứ nhất (dòng 18): Kích hoạt 1 lần duy nhất khi component mount (dependency array rỗng). Mục đích là load dữ liệu từ sinhvien.json, hocphan.json, ketqua.json bằng Promise.all().

useEffect thứ hai (dòng 41): Kích hoạt mỗi khi state studentId thay đổi. Nếu studentId có 8 chữ số thì tự động gọi hàm handleSearch() để tra cứu kết quả.


CẤU TRÚC COMPONENT

App.jsx - Component cha, quản lý state toàn cục
SearchForm.jsx - Component form nhập mã sinh viên
ResultTable.jsx - Component hiển thị bảng kết quả
LoadingIndicator.jsx - Component hiển thị trạng thái loading