# Giải thích code - Bài tập tra cứu điểm

Làm bởi: Phùng Minh Vũ - 20235252

## Mô tả chung

Đây là bài tập làm trang web tra cứu điểm sinh viên, dùng JavaScript bất đồng bộ, Promise, async/await.

## Cấu trúc file

```
├── index.html          <- File giao diện chính
├── styles.css          <- File CSS để làm đẹp
├── script.js           <- File JavaScript xử lý logic 
├── sinhvien.json       <- Dữ liệu sinh viên
├── hocphan.json        <- Dữ liệu học phần
└── ketqua.json         <- Dữ liệu điểm của mình
```

## Giải thích code JavaScript (script.js)

### 1. Phần khai báo biến (dòng 1-20)

Đầu tiên khai báo mấy cái constant và biến để lưu dữ liệu:

```javascript
const SIMULATED_DELAY = 1000; // Delay 1 giây để giả lập như đang load từ server
let sinhvienData = [];  // Mảng chứa data sinh viên
let hocphanData = [];   // Mảng chứa data học phần
let ketquaData = [];    // Mảng chứa data kết quả
```

Còn có DOM element để thao tác với HTML.

### 2. Load dữ liệu ban đầu (dòng 30-55)

Đây là phần **BẤT ĐỒNG BỘ** đầu tiên được yêu cầu:

```javascript
async function loadInitialData() {
    // Dùng Promise.all() để load 3 file JSON cùng lúc
    const [sinhvien, hocphan, ketqua] = await Promise.all([
        fetchJSONData('sinhvien.json'),
        fetchJSONData('hocphan.json'),
        fetchJSONData('ketqua.json')
    ]);
}
```

**Giải thích:**
- `async/await`: Để code đợi load xong mới chạy tiếp
- `Promise.all()`: Load 3 file cùng lúc thay vì load lần lượt (nhanh hơn)
- Dùng `try...catch` để bắt lỗi nếu load fail

### 3. Hàm fetch JSON (dòng 57-76)

```javascript
function fetchJSONData(filename) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {  // Fake delay như đang call API
            fetch(filename)
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(error => reject(error));
        }, SIMULATED_DELAY);
    });
}
```

**Giải thích:**
- Dùng `Promise` để xử lý bất đồng bộ
- `setTimeout()` để giả lập network delay (như đang gọi API thật)
- `fetch()` để đọc file JSON
- Nếu thành công thì `resolve()`, fail thì `reject()`

### 4. Xử lý tìm kiếm (dòng 95-165)

Đây là phần chính khi user nhấn nút "Tra cứu":

```javascript
async function handleSearch() {
    // Check cache trước
    const cachedData = getFromCache(studentId);
    if (cachedData) {
        displayResults(cachedData, true);
        return;
    }
    
    // Nếu không có cache thì fetch mới
    const student = await fetchStudentData(studentId);
    const results = await fetchStudentResults(studentId);
    const enrichedResults = await enrichResultsWithCourseData(results);
}
```

**Flow xử lý:**
1. Check localStorage xem có cache không → nếu có thì dùng luôn
2. Nếu không thì fetch data từ mảng (giả lập fetch từ server)
3. Dùng `await` để đợi từng bước hoàn thành
4. Cuối cùng hiển thị kết quả

### 5. Làm giàu dữ liệu (dòng 185-200)

```javascript
async function enrichResultsWithCourseData(results) {
    const enrichedPromises = results.map(result => {
        return new Promise((resolve) => {
            // Tìm thông tin học phần tương ứng
            const course = hocphanData.find(h => h.cid === result.cid);
            resolve({
                ...result,
                courseName: course?.name,
                credits: course?.credits
            });
        });
    });
    
    return Promise.all(enrichedPromises);
}
```

**Giải thích:**
- Mỗi kết quả điểm chỉ có `cid` (mã môn)
- Phải match với `hocphan.json` để lấy tên môn, số tín chỉ
- Dùng `map()` + `Promise.all()` để xử lý nhiều record cùng lúc

### 6. Tính CPA (dòng 220-235)

```javascript
// Tính CPA theo hệ điểm 4.0
results.forEach(result => {
    const letterGrade = getLetterGrade(result.score);  // Đổi điểm số sang A, B, C...
    const gradePoint = getGradePoint(letterGrade);     // Đổi chữ sang điểm 4.0
    totalGradePoints += gradePoint * result.credits;
    totalCredits += result.credits;
});

const cpa = totalGradePoints / totalCredits;
```

**Công thức:**
```
CPA = (Tổng điểm quy đổi × Tín chỉ) / Tổng tín chỉ
```

Ví dụ: Môn A+ (4.0) với 3 TC = 4.0 × 3 = 12 điểm

### 7. Cache với localStorage (dòng 380-420)

```javascript
function saveToCache(studentId, data) {
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(expiryKey, expiryTime);  // Hết hạn sau 30 phút
}

function getFromCache(studentId) {
    // Check xem còn hạn không
    if (Date.now() > expiryTime) {
        return null;  // Hết hạn rồi
    }
    return JSON.parse(cachedData);
}
```

**Giải thích:**
- Lưu kết quả vào `localStorage` để lần sau không phải load lại
- Có thời gian hết hạn 30 phút
- Giúp trang load nhanh hơn

## Các kỹ thuật bất đồng bộ đã dùng

### 1. async/await
```javascript
async function loadData() {
    const data = await fetch('file.json');  // Đợi load xong
    console.log(data);  // Chạy sau khi load xong
}
```

### 2. Promise
```javascript
function getData() {
    return new Promise((resolve, reject) => {
        // Làm gì đó
        if (thành công) resolve(data);
        else reject(error);
    });
}
```

### 3. Promise.all()
```javascript
// Load nhiều cái cùng lúc, nhanh hơn load lần lượt
const [a, b, c] = await Promise.all([
    loadA(),
    loadB(),
    loadC()
]);
```

### 4. try...catch
```javascript
try {
    await loadData();  // Thử load
} catch (error) {
    console.error(error);  // Nếu lỗi thì bắt ở đây
}
```

## Quy trình làm bài

### Bước 1: Setup HTML/CSS
- Copy structure từ tracuu_ketqua.html
- Tách CSS ra file riêng
- Làm giao diện đẹp với gradient, animation

### Bước 2: Chuẩn bị dữ liệu
- Tạo 3 file JSON từ bảng điểm thật của mình
- Thêm vài sinh viên khác để test đa dạng

### Bước 3: Viết JavaScript
1. Load dữ liệu từ JSON (dùng fetch + Promise)
2. Xử lý tìm kiếm (dùng async/await)
3. Tính CPA theo công thức
4. Hiển thị kết quả
5. Thêm cache để tăng performance

### Bước 4: Test và debug
- Test với nhiều mã sinh viên khác nhau
- Check console để xem có lỗi không
- Test cache có hoạt động không

### Bước 5: Hoàn thiện
- Viết README
- Comment code
- Dọn dẹp code thừa



