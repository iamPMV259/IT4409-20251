// Constants
const CACHE_KEY_PREFIX = 'student_results_';
const CACHE_EXPIRY_KEY_PREFIX = 'student_results_expiry_';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const SIMULATED_DELAY = 1000; // 1 second

// Data storage
let sinhvienData = [];
let hocphanData = [];
let ketquaData = [];

// DOM Elements
const studentIdInput = document.getElementById('studentId');
const searchBtn = document.getElementById('searchBtn');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const errorMessage = document.getElementById('errorMessage');
const cacheInfo = document.getElementById('cacheInfo');
const studentInfo = document.getElementById('studentInfo');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const resultsBody = document.getElementById('resultsBody');

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
    setupEventListeners();
    cleanExpiredCache();
});

// Load initial data from JSON files with Promise
async function loadInitialData() {
    try {
        console.log('🔄 Đang tải dữ liệu từ các file JSON...');
        
        const [sinhvien, hocphan, ketqua] = await Promise.all([
            fetchJSONData('sinhvien.json'),
            fetchJSONData('hocphan.json'),
            fetchJSONData('ketqua.json')
        ]);
        
        sinhvienData = sinhvien;
        hocphanData = hocphan;
        ketquaData = ketqua;
        
        console.log('✅ Dữ liệu đã được tải thành công');
        console.log(`   - Sinh viên: ${sinhvienData.length} records`);
        console.log(`   - Học phần: ${hocphanData.length} records`);
        console.log(`   - Kết quả: ${ketquaData.length} records`);
    } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        showError('Không thể tải dữ liệu hệ thống. Vui lòng kiểm tra các file JSON hoặc chạy qua web server.');
    }
}

// Fetch JSON data with simulated delay (Promise-based)
function fetchJSONData(filename) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch(filename)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(`✅ Đã load: ${filename}`);
                    resolve(data);
                })
                .catch(error => {
                    console.error(`❌ Lỗi khi load ${filename}:`, error);
                    reject(error);
                });
        }, SIMULATED_DELAY);
    });
}

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    clearCacheBtn.addEventListener('click', handleClearCache);
    
    studentIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    studentIdInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

// Handle search
async function handleSearch() {
    const studentId = studentIdInput.value.trim();
    
    if (!studentId) {
        showError('Vui lòng nhập mã số sinh viên!');
        return;
    }
    
    if (studentId.length !== 8) {
        showError('Mã số sinh viên phải có 8 chữ số!');
        return;
    }
    
    // Kiểm tra xem dữ liệu đã được load chưa
    if (sinhvienData.length === 0 || hocphanData.length === 0 || ketquaData.length === 0) {
        showError('Dữ liệu chưa được tải. Vui lòng đợi một chút và thử lại!');
        return;
    }
    
    hideError();
    hideCacheInfo();
    hideResults();
    hideStudentInfo();
    
    const cachedData = getFromCache(studentId);
    if (cachedData) {
        displayResults(cachedData, true);
        return;
    }
    
    showLoading();
    disableSearch();
    
    try {
        const student = await fetchStudentData(studentId);
        
        if (!student) {
            throw new Error('Không tìm thấy thông tin sinh viên với mã số này!');
        }
        
        const results = await fetchStudentResults(studentId);
        
        if (results.length === 0) {
            throw new Error('Sinh viên chưa có kết quả học tập!');
        }
        
        const enrichedResults = await enrichResultsWithCourseData(results);
        
        const completeData = {
            student,
            results: enrichedResults
        };
        
        saveToCache(studentId, completeData);
        displayResults(completeData, false);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
        enableSearch();
    }
}

// Fetch functions with simulated delay
async function fetchStudentData(studentId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const student = sinhvienData.find(s => s.sid === studentId);
            resolve(student);
        }, SIMULATED_DELAY);
    });
}

async function fetchStudentResults(studentId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const results = ketquaData.filter(k => k.sid === studentId);
            resolve(results);
        }, SIMULATED_DELAY);
    });
}

async function enrichResultsWithCourseData(results) {
    const enrichedPromises = results.map(result => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const course = hocphanData.find(h => h.cid === result.cid);
                resolve({
                    ...result,
                    courseName: course?.name || 'N/A',
                    credits: course?.credits || 0
                });
            }, 200);
        });
    });
    
    return Promise.all(enrichedPromises);
}

// Display results
function displayResults(data, fromCache = false) {
    const { student, results } = data;
    
    document.getElementById('displaySid').textContent = student.sid;
    document.getElementById('displayName').textContent = student.name;
    document.getElementById('displayDob').textContent = formatDate(student.dob);
    showStudentInfo();
    
    const totalCourses = results.length;
    
    // Tính CPA theo hệ điểm 4.0
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    results.forEach(result => {
        const letterGrade = getLetterGrade(result.score);
        const gradePoint = getGradePoint(letterGrade);
        totalGradePoints += gradePoint * result.credits;
        totalCredits += result.credits;
    });
    
    const cpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
    
    document.getElementById('totalCourses').textContent = totalCourses;
    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('avgGPA').textContent = cpa;
    
    results.sort((a, b) => {
        if (a.term !== b.term) {
            return b.term.localeCompare(a.term);
        }
        return a.cid.localeCompare(b.cid);
    });
    
    resultsBody.innerHTML = '';
    results.forEach((result, index) => {
        const row = createResultRow(result, index + 1);
        resultsBody.appendChild(row);
    });
    
    showResults();
    
    if (fromCache) {
        showCacheInfo();
    }
}

// Create result row
function createResultRow(result, index) {
    const row = document.createElement('tr');
    
    const letterGrade = getLetterGrade(result.score);
    const classification = getClassification(result.score);
    const gradeClass = getGradeClass(letterGrade);
    const classificationClass = getClassificationClass(classification);
    
    row.innerHTML = `
        <td>${index}</td>
        <td>${result.cid}</td>
        <td>${result.courseName}</td>
        <td>${result.credits}</td>
        <td>${formatTerm(result.term)}</td>
        <td>${result.score.toFixed(1)}</td>
        <td class="${gradeClass}">${letterGrade}</td>
        <td><span class="classification ${classificationClass}">${classification}</span></td>
    `;
    
    return row;
}

// Utility functions
function getLetterGrade(score) {
    if (score >= 9.0) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8.0) return 'B+';
    if (score >= 7.0) return 'B';
    if (score >= 6.5) return 'C+';
    if (score >= 5.5) return 'C';
    if (score >= 5.0) return 'D+';
    if (score >= 4.0) return 'D';
    return 'F';
}

function getGradePoint(letterGrade) {
    const gradePoints = {
        'A+': 4.0,
        'A': 4.0,
        'B+': 3.5,
        'B': 3.0,
        'C+': 2.5,
        'C': 2.0,
        'D+': 1.5,
        'D': 1.0,
        'F': 0.0
    };
    return gradePoints[letterGrade] || 0.0;
}

function getClassification(score) {
    if (score >= 9.0) return 'Xuất sắc';
    if (score >= 8.0) return 'Giỏi';
    if (score >= 7.0) return 'Khá';
    if (score >= 5.5) return 'Trung bình';
    return 'Yếu';
}

function getGradeClass(grade) {
    if (grade.startsWith('A')) return 'grade-A';
    if (grade.startsWith('B')) return 'grade-B';
    if (grade.startsWith('C')) return 'grade-C';
    if (grade.startsWith('D')) return 'grade-D';
    return 'grade-F';
}

function getClassificationClass(classification) {
    switch (classification) {
        case 'Xuất sắc':
        case 'Giỏi':
            return 'classification-excellent';
        case 'Khá':
            return 'classification-good';
        case 'Trung bình':
            return 'classification-average';
        default:
            return 'classification-pass';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatTerm(term) {
    const year = term.substring(0, 4);
    const semester = term.substring(4);
    return `HK ${semester} - ${year}`;
}

// Cache functions
function saveToCache(studentId, data) {
    try {
        const cacheKey = CACHE_KEY_PREFIX + studentId;
        const expiryKey = CACHE_EXPIRY_KEY_PREFIX + studentId;
        const expiryTime = Date.now() + CACHE_DURATION;
        
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(expiryKey, expiryTime.toString());
        
        console.log(`✅ Đã lưu cache cho SV: ${studentId}`);
    } catch (error) {
        console.warn('⚠️ Không thể lưu cache:', error);
    }
}

function getFromCache(studentId) {
    try {
        const cacheKey = CACHE_KEY_PREFIX + studentId;
        const expiryKey = CACHE_EXPIRY_KEY_PREFIX + studentId;
        
        const cachedData = localStorage.getItem(cacheKey);
        const expiryTime = localStorage.getItem(expiryKey);
        
        if (!cachedData || !expiryTime) {
            return null;
        }
        
        if (Date.now() > parseInt(expiryTime)) {
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(expiryKey);
            return null;
        }
        
        console.log(`✅ Lấy từ cache cho SV: ${studentId}`);
        return JSON.parse(cachedData);
    } catch (error) {
        console.warn('⚠️ Không thể đọc cache:', error);
        return null;
    }
}

function cleanExpiredCache() {
    try {
        const keys = Object.keys(localStorage);
        let cleanedCount = 0;
        
        keys.forEach(key => {
            if (key.startsWith(CACHE_EXPIRY_KEY_PREFIX)) {
                const expiryTime = parseInt(localStorage.getItem(key));
                if (Date.now() > expiryTime) {
                    const studentId = key.replace(CACHE_EXPIRY_KEY_PREFIX, '');
                    const cacheKey = CACHE_KEY_PREFIX + studentId;
                    
                    localStorage.removeItem(key);
                    localStorage.removeItem(cacheKey);
                    cleanedCount++;
                }
            }
        });
        
        if (cleanedCount > 0) {
            console.log(`🧹 Đã xóa ${cleanedCount} cache hết hạn`);
        }
    } catch (error) {
        console.warn('⚠️ Lỗi khi dọn cache:', error);
    }
}

function handleClearCache() {
    try {
        const keys = Object.keys(localStorage);
        let clearedCount = 0;
        
        keys.forEach(key => {
            if (key.startsWith(CACHE_KEY_PREFIX) || key.startsWith(CACHE_EXPIRY_KEY_PREFIX)) {
                localStorage.removeItem(key);
                clearedCount++;
            }
        });
        
        alert(`✅ Đã xóa ${Math.floor(clearedCount / 2)} bản ghi cache!`);
    } catch (error) {
        alert('❌ Không thể xóa cache!');
    }
}

// UI helper functions
function showError(message) {
    errorMessage.textContent = '❌ ' + message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showCacheInfo() {
    cacheInfo.style.display = 'block';
}

function hideCacheInfo() {
    cacheInfo.style.display = 'none';
}

function showLoading() {
    loadingIndicator.style.display = 'block';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function showStudentInfo() {
    studentInfo.style.display = 'block';
}

function hideStudentInfo() {
    studentInfo.style.display = 'none';
}

function showResults() {
    resultsSection.style.display = 'block';
}

function hideResults() {
    resultsSection.style.display = 'none';
}

function disableSearch() {
    searchBtn.disabled = true;
    document.querySelector('.btn-text').style.display = 'none';
    document.querySelector('.btn-loader').style.display = 'inline';
}

function enableSearch() {
    searchBtn.disabled = false;
    document.querySelector('.btn-text').style.display = 'inline';
    document.querySelector('.btn-loader').style.display = 'none';
}