import './LoadingIndicator.css';

function LoadingIndicator() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Đang tải dữ liệu...</p>
    </div>
  );
}

export default LoadingIndicator;