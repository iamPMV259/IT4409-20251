import './ResultTable.css';

function ResultTable({ student, results }) {
  // Hàm chuyển điểm số sang điểm chữ
  const getLetterGrade = (score) => {
    if (score >= 9.0) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8.0) return 'B+';
    if (score >= 7.0) return 'B';
    if (score >= 6.5) return 'C+';
    if (score >= 5.5) return 'C';
    if (score >= 5.0) return 'D+';
    if (score >= 4.0) return 'D';
    return 'F';
  };

  // Hàm lấy điểm quy đổi theo hệ 4.0
  const getGradePoint = (letterGrade) => {
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
      'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0
    };
    return gradePoints[letterGrade] || 0.0;
  };

  // Hàm lấy xếp loại
  const getClassification = (score) => {
    if (score >= 9.0) return 'Xuất sắc';
    if (score >= 8.0) return 'Giỏi';
    if (score >= 7.0) return 'Khá';
    if (score >= 5.5) return 'Trung bình';
    return 'Yếu';
  };

  // Hàm lấy CSS class cho điểm chữ
  const getGradeClass = (grade) => {
    if (grade.startsWith('A')) return 'grade-A';
    if (grade.startsWith('B')) return 'grade-B';
    if (grade.startsWith('C')) return 'grade-C';
    if (grade.startsWith('D')) return 'grade-D';
    return 'grade-F';
  };

  // Hàm lấy CSS class cho xếp loại
  const getClassificationClass = (classification) => {
    if (classification === 'Xuất sắc' || classification === 'Giỏi') 
      return 'classification-excellent';
    if (classification === 'Khá') 
      return 'classification-good';
    if (classification === 'Trung bình') 
      return 'classification-average';
    return 'classification-pass';
  };

  // Hàm format học kỳ
  const formatTerm = (term) => {
    const year = term.substring(0, 4);
    const semester = term.substring(4);
    return `HK ${semester} - ${year}`;
  };

  // Hàm format ngày sinh
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Tính toán thống kê
  const totalCourses = results.length;
  const totalCredits = results.reduce((sum, r) => sum + r.credits, 0);
  
  // Tính CPA
  let totalGradePoints = 0;
  results.forEach(result => {
    const letterGrade = getLetterGrade(result.score);
    const gradePoint = getGradePoint(letterGrade);
    totalGradePoints += gradePoint * result.credits;
  });
  const cpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

  // Sắp xếp kết quả theo học kỳ và mã môn
  const sortedResults = [...results].sort((a, b) => {
    if (a.term !== b.term) {
      return b.term.localeCompare(a.term);
    }
    return a.cid.localeCompare(b.cid);
  });

  return (
    <div className="results-container">
      {/* Thông tin sinh viên */}
      <div className="student-info">
        <h2>Thông tin sinh viên</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Mã sinh viên:</strong>
            <span>{student.sid}</span>
          </div>
          <div className="info-item">
            <strong>Họ và tên:</strong>
            <span>{student.name}</span>
          </div>
          <div className="info-item">
            <strong>Ngày sinh:</strong>
            <span>{formatDate(student.dob)}</span>
          </div>
        </div>
      </div>

      {/* Thống kê */}
      <div className="statistics">
        <div className="stat-item">
          <span className="stat-label">Tổng số học phần:</span>
          <span className="stat-value">{totalCourses}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tổng tín chỉ:</span>
          <span className="stat-value">{totalCredits}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">CPA (hệ 4.0):</span>
          <span className="stat-value">{cpa}</span>
        </div>
      </div>

      {/* Bảng kết quả */}
      <div className="results-header">
        <h2>Kết quả học tập</h2>
      </div>

      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã HP</th>
              <th>Tên học phần</th>
              <th>Tín chỉ</th>
              <th>Học kỳ</th>
              <th>Điểm số</th>
              <th>Điểm chữ</th>
              <th>Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => {
              const letterGrade = getLetterGrade(result.score);
              const classification = getClassification(result.score);
              
              return (
                <tr key={`${result.cid}-${result.term}`}>
                  <td>{index + 1}</td>
                  <td>{result.cid}</td>
                  <td>{result.courseName}</td>
                  <td>{result.credits}</td>
                  <td>{formatTerm(result.term)}</td>
                  <td>{result.score.toFixed(1)}</td>
                  <td className={getGradeClass(letterGrade)}>{letterGrade}</td>
                  <td>
                    <span className={`classification ${getClassificationClass(classification)}`}>
                      {classification}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultTable;