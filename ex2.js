const students = [
    {
        name: "A",
        score: 1
    },
    {
        name: "B",
        score: 2
    },
    {
        name: "C",
        score: 3
    }
]

const validStudents = students.filter(student => student.score >= 0);

const scores = validStudents.map(student => student.score);

const totalScore = scores.reduce((sum, currentScore) => sum + currentScore, 0);

const averageScore = totalScore / scores.length;

console.log(averageScore);

