import { useEffect, useState } from 'react';
import './App.css';
import LoadingIndicator from './components/LoadingIndicator';
import ResultTable from './components/ResultTable';
import SearchForm from './components/SearchForm';

function App() {
  // State quản lý toàn bộ ứng dụng
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // State lưu dữ liệu từ JSON files
  const [sinhvienData, setSinhvienData] = useState([]);
  const [hocphanData, setHocphanData] = useState([]);
  const [ketquaData, setKetquaData] = useState([]);

  // useEffect: Load dữ liệu JSON khi component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Đang load dữ liệu JSON...');
        
        const [sinhvienRes, hocphanRes, ketquaRes] = await Promise.all([
          fetch('/sinhvien.json'),
          fetch('/hocphan.json'),
          fetch('/ketqua.json')
        ]);

        const sinhvien = await sinhvienRes.json();
        const hocphan = await hocphanRes.json();
        const ketqua = await ketquaRes.json();

        setSinhvienData(sinhvien);
        setHocphanData(hocphan);
        setKetquaData(ketqua);

        console.log('Đã load xong dữ liệu');
      } catch (err) {
        console.error('Lỗi load dữ liệu:', err);
        setError('Không thể tải dữ liệu hệ thống!');
      }
    };

    loadData();
  }, []);

  // useEffect: Tự động tra cứu khi studentId thay đổi
  useEffect(() => {
    if (studentId && studentId.length === 8) {
      handleSearch();
    }
  }, [studentId]);

  // Hàm xử lý tra cứu
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const student = sinhvienData.find(s => s.sid === studentId);
      
      if (!student) {
        throw new Error('Không tìm thấy thông tin sinh viên với mã số này!');
      }

      const studentResults = ketquaData.filter(k => k.sid === studentId);
      
      if (studentResults.length === 0) {
        throw new Error('Sinh viên chưa có kết quả học tập!');
      }

      const enrichedResults = studentResults.map(result => {
        const course = hocphanData.find(h => h.cid === result.cid);
        return {
          ...result,
          courseName: course?.name || 'N/A',
          credits: course?.credits || 0
        };
      });

      setResults({
        student,
        results: enrichedResults
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSearch = (id) => {
    setStudentId(id);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hệ thống tra cứu kết quả học tập</h1>
        <p className="subtitle">Tra cứu điểm số và thành tích học tập của sinh viên</p>
      </header>

      <SearchForm onSearch={onSearch} isLoading={isLoading} />

      {isLoading && <LoadingIndicator />}

      {error && !isLoading && (
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">❌</span>
            <span className="error-text">{error}</span>
          </div>
        </div>
      )}

      {results && !isLoading && !error && (
        <ResultTable 
          student={results.student} 
          results={results.results} 
        />
      )}

      {!studentId && !isLoading && !error && !results && (
        <div className="instruction-container">
          <div className="instruction-card">
            <h3>Hướng dẫn sử dụng</h3>
            <ol>
              <li>Nhập mã số sinh viên (8 chữ số)</li>
              <li>Nhấn nút "Tra cứu" hoặc Enter</li>
              <li>Xem kết quả học tập</li>
            </ol>
            <div className="example-codes">
              <p><strong>Mã số để test:</strong></p>
              <ul>
                <li>20235252 - Phùng Minh Vũ (18 môn)</li>
                <li>20235001 - Nguyễn Văn An (8 môn)</li>
                <li>20235002 - Trần Thị Bình (7 môn)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;