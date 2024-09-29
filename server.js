const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// دالة لكتابة البيانات إلى ملف CSV
function writeToCSV(data) {
    const file = 'attendance.csv';
    const fileExists = fs.existsSync(file);
    
    const headers = ['الاسم', 'البريد الإلكتروني', 'رقم الهاتف', 'حضور اليوم الأول', 'حضور اليوم الثاني', 'حضور اليوم الثالث'];

    // إذا كان الملف جديدًا، إضافة العناوين
    if (!fileExists) {
        fs.writeFileSync(file, headers.join(',') + '\n');
    }

    const newRow = [data.name, data.email, data.phone, 1, 0, 0].join(',') + '\n';
    fs.appendFileSync(file, newRow);
}

// نقطة نهاية للتسجيل
app.post('/register', (req, res) => {
    writeToCSV(req.body);
    res.send("<script>alert('تم تسجيل حضورك لليوم الأول.'); window.location.href = '/';</script>");
});

// نقطة نهاية لتسجيل الحضور
app.get('/checkin', (req, res) => {
    const email = req.query.email;
    const currentDay = 2; // اليوم الحالي

    const rows = fs.readFileSync('attendance.csv', 'utf-8').split('\n').map(row => row.split(','));
    const header = rows[0];
    const found = rows.find(row => row[1] === email);

    if (found) {
        if (currentDay === 2 && found[4] == 0) {
            found[4] = 1; // تسجيل حضور اليوم الثاني
            res.send("تم تسجيل حضورك لليوم الثاني.");
        } else {
            res.send("لقد تم تسجيل حضورك سابقًا.");
        }
    } else {
        res.send("لم يتم العثور على بياناتك. <a href='/'>اضغط هنا للتسجيل</a>.");
    }

    // إعادة كتابة الملف مع التحديثات
    const updatedData = rows.map(row => row.join(',')).join('\n');
    fs.writeFileSync('attendance.csv', updatedData);
});

// نقطة النهاية للرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
