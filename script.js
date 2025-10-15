const courseData = [
    // Dữ liệu học kỳ 2024.1
    { semester: '2024.1', code: 'IT3030', name: 'Kiến trúc máy tính', credits: 3, score: 5.8, grade: 'C' },
    { semester: '2024.1', code: 'IT3080', name: 'Mạng máy tính', credits: 3, score: 6.5, grade: 'C+' },
    { semester: '2024.1', code: 'IT3090', name: 'Cơ sở dữ liệu', credits: 3, score: 9.0, grade: 'A' },
    { semester: '2024.1', code: 'IT3100', name: 'Lập trình hướng đối tượng', credits: 2, score: 7.1, grade: 'B' },
    { semester: '2024.1', code: 'IT4480', name: 'Làm việc nhóm và kỹ năng giao tiếp', credits: 2, score: 9.0, grade: 'A' },
    { semester: '2024.1', code: 'MI2020', name: 'Xác suất thống kê', credits: 3, score: 7.0, grade: 'B' },
    { semester: '2024.1', code: 'MI3052', name: 'Nhập môn các phương pháp tối ưu', credits: 2, score: 4.5, grade: 'D' },
    { semester: '2024.1', code: 'PE2801', name: 'Nhảy xa', credits: 0, score: 5.0, grade: 'D+' },
    { semester: '2024.1', code: 'PH1120', name: 'Vật lý đại cương II', credits: 3, score: 4.3, grade: 'D' },
    // Dữ liệu học kỳ 2024.2
    { semester: '2024.2', code: 'IT2030', name: 'Technical Writing and Presentation', credits: 3, score: 7.3, grade: 'B' },
    { semester: '2024.2', code: 'IT3040', name: 'Kỹ thuật lập trình', credits: 2, score: 7.8, grade: 'B' },
    { semester: '2024.2', code: 'IT3070', name: 'Nguyên lý hệ điều hành', credits: 3, score: 6.8, grade: 'C+' },
    { semester: '2024.2', code: 'IT3160', name: 'Nhập môn Trí tuệ nhân tạo', credits: 3, score: 7.3, grade: 'B' },
    { semester: '2024.2', code: 'IT3170', name: 'Thuật toán ứng dụng', credits: 2, score: 10.0, grade: 'A+' },
    { semester: '2024.2', code: 'MI1131', name: 'Giải tích III', credits: 3, score: 5.8, grade: 'C' },
    { semester: '2024.2', code: 'PE2101', name: 'Bóng chuyền 1', credits: 0, score: 5.0, grade: 'D+' },
    { semester: '2024.2', code: 'PE2401', name: 'Bóng bàn 1', credits: 0, score: 7.0, grade: 'B' },
    { semester: '2024.2', code: 'SSH1121', name: 'Kinh tế chính trị Mác - Lênin', credits: 2, score: 7.3, grade: 'B' },
];

const tableBody = document.querySelector('#results-table tbody');
const highlightBtn = document.getElementById('highlight-btn');
const gpaBtn = document.getElementById('gpa-btn');
const gpaResultEl = document.getElementById('gpa-result');
const filterBtn = document.getElementById('filter-btn');
const sortBtn = document.getElementById('sort-btn');
const resetBtn = document.getElementById('reset-btn');

let isHighlighted = false;
let isFiltered = false;
let sortState = 'none'; // 'none', 'asc', 'desc'

// --- Core Functions ---

function gradeToPoint(grade) {
    const gradeMap = {
        'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
        'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0
    };
    return gradeMap[grade] || 0;
}

function renderTable(data) {
    tableBody.innerHTML = ''; // Clear existing table
    data.forEach(course => {
        const row = document.createElement('tr');
        row.className = 'border-b transition duration-300 ease-in-out';
        row.innerHTML = `
            <td class="px-6 py-4">${course.semester}</td>
            <td class="px-6 py-4 font-mono">${course.code}</td>
            <td class="px-6 py-4 font-medium">${course.name}</td>
            <td class="px-6 py-4 text-center">${course.credits}</td>
            <td class="px-6 py-4 text-center font-semibold">${course.score.toFixed(1)}</td>
            <td class="px-6 py-4 text-center font-bold">${course.grade}</td>
        `;
        tableBody.appendChild(row);
    });
    // Re-apply highlight if it was active
    if (isHighlighted) {
        applyHighlight();
    }
}


function applyHighlight() {
    tableBody.querySelectorAll('tr').forEach(row => {
        const gradeCell = row.children[5];
        const grade = gradeCell.textContent.trim();


        row.style.backgroundColor = '';
        row.style.color = '';

        if (grade === 'A' || grade === 'A+') {
            row.style.backgroundColor = '#dcfce7'; // Tương đương green-100 của Tailwind
            row.style.color = '#166534'; // Tương đương green-800 của Tailwind
        } else if (grade === 'F') {
            row.style.backgroundColor = '#fee2e2'; // Tương đương red-100 của Tailwind
            row.style.color = '#991b1b'; // Tương đương red-800 của Tailwind
        }
    });
}

function removeHighlight() {
    tableBody.querySelectorAll('tr').forEach(row => {
        row.style.backgroundColor = '';
        row.style.color = '';
    });
}

// --- Event Listeners ---

highlightBtn.addEventListener('click', () => {
    isHighlighted = !isHighlighted;
    if (isHighlighted) {
        applyHighlight();
        highlightBtn.textContent = 'Bỏ tô màu';
        highlightBtn.classList.replace('bg-blue-500', 'bg-red-500');
        highlightBtn.classList.replace('hover:bg-blue-600', 'hover:bg-red-600');
    } else {
        removeHighlight();
        highlightBtn.textContent = 'Tô màu Điểm';
        highlightBtn.classList.replace('bg-red-500', 'bg-blue-500');
        highlightBtn.classList.replace('hover:bg-red-600', 'hover:bg-blue-600');
    }
});

gpaBtn.addEventListener('click', () => {
    const gpaBySemester = courseData.reduce((acc, course) => {
        if (course.credits > 0) { // Only count courses with credits
            if (!acc[course.semester]) {
                acc[course.semester] = { totalPoints: 0, totalCredits: 0 };
            }
            acc[course.semester].totalPoints += gradeToPoint(course.grade) * course.credits;
            acc[course.semester].totalCredits += course.credits;
        }
        return acc;
    }, {});

    let resultHTML = '';
    for (const semester in gpaBySemester) {
        const gpa = gpaBySemester[semester].totalPoints / gpaBySemester[semester].totalCredits;
        resultHTML += `<p>GPA học kỳ ${semester}: <span class="text-blue-600">${gpa.toFixed(2)}</span></p>`;
    }
    gpaResultEl.innerHTML = resultHTML;
    gpaResultEl.classList.remove('hidden');
});

filterBtn.addEventListener('click', () => {
    isFiltered = !isFiltered;
    if (isFiltered) {
        const filteredData = courseData.filter(c => c.grade === 'A' || c.grade === 'A+');
        renderTable(filteredData);
        filterBtn.textContent = 'Hiển thị tất cả';
    } else {
        renderTable(courseData);
        filterBtn.textContent = 'Lọc Điểm A/A+';
    }
});

sortBtn.addEventListener('click', () => {
    // Lấy dữ liệu hiện tại đang hiển thị trên bảng để sắp xếp
    const currentCodes = Array.from(tableBody.querySelectorAll('tr')).map(row => row.children[1].textContent);
    let currentData = courseData.filter(c => currentCodes.includes(c.code));

    if (sortState !== 'asc') {
        currentData.sort((a, b) => a.score - b.score);
        sortState = 'asc';
        sortBtn.textContent = 'Sắp xếp (Tăng dần)';
    } else {
        currentData.sort((a, b) => b.score - a.score);
        sortState = 'desc';
        sortBtn.textContent = 'Sắp xếp (Giảm dần)';
    }
    renderTable(currentData);
});

resetBtn.addEventListener('click', () => {
    // Đặt lại trạng thái tô màu
    isHighlighted = false;
    removeHighlight(); // Sẽ được gọi bên trong renderTable nhưng gọi ở đây để chắc chắn
    highlightBtn.textContent = 'Tô màu Điểm';
    highlightBtn.classList.replace('bg-red-500', 'bg-blue-500');
    highlightBtn.classList.replace('hover:bg-red-600', 'hover:bg-blue-600');

    // Đặt lại hiển thị GPA
    gpaResultEl.classList.add('hidden');
    gpaResultEl.innerHTML = '';

    // Đặt lại bộ lọc
    isFiltered = false;
    filterBtn.textContent = 'Lọc Điểm A/A+';

    // Đặt lại sắp xếp
    sortState = 'none';
    sortBtn.textContent = 'Sắp xếp Điểm';

    renderTable(courseData);
});

window.onload = () => {
    renderTable(courseData);
};

