// PWA Install
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'flex';
});

document.getElementById('installBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Install ${outcome}`);
        deferredPrompt = null;
        document.getElementById('installBtn').style.display = 'none';
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed');
    document.getElementById('installBtn').style.display = 'none';
});

// Service Worker Registration with auto-update
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('Service Worker registered');
                
                // Check for updates every 60 seconds
                setInterval(() => {
                    reg.update();
                }, 60000);
                
                // Listen for updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    console.log('New service worker found');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New version available, reloading...');
                            // Send message to skip waiting
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                            // Reload page after a short delay
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    });
                });
            })
            .catch(err => console.log('Service Worker registration failed', err));
    });
    
    // Reload page when new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            console.log('Controller changed, reloading page');
            window.location.reload();
        }
    });
}

// Truth or Dare Game
const truthQuestions = [
    "İlk sevdiyin insan kimdir?",
    "Ən böyük sirrini paylaş?",
    "Kimdən xoşun gəlir?",
    "Ən utanclı anını danış?",
    "Nəyi gizli saxlayırsan?",
    "Kim haqqında düşünürsən?",
    "Ən böyük qorxun nədir?",
    "Kimə inanmırsan?",
    "Pulu yoxsa sevgini seçərsən?",
    "Ən çox nədən peşman olursan?"
];

const dareQuestions = [
    "Qışqır, 'Başla!'",
    "10 dəfə ətrafında fırlan!",
    "Kəsdən zəng vur və sevgi etirafı et!",
    "30 saniyə gözlərini bağla və dans et!",
    "Hamıya bir nağıl danış!",
    "Yerdə sürün və heyvan səsi çıxar!",
    "Telefonda oxuduğun son mesajı oxu!",
    "Ən yaxın adamına yazışdığın son mesajı göstər!",
    "5 dəfə qışqır 'Mən qəhrəmanam!'",
    "20 saniyə dil çıxar və heç nə demə!"
];

let isSpinning = false;

// Navigation Functions
function openCalculator(type) {
    document.getElementById('mainMenu').style.display = 'none';
    document.querySelector('.info-btn').style.display = 'none';
    
    if (type === 'game') {
        document.getElementById('gameCalc').style.display = 'block';
        resetGame();
    } else if (type === 'semester') {
        document.getElementById('semesterCalc').style.display = 'block';
    } else if (type === 'payment') {
        document.getElementById('paymentCalc').style.display = 'block';
    } else if (type === 'age') {
        document.getElementById('ageCalc').style.display = 'block';
    }
}

function backToMenu() {
    document.getElementById('mainMenu').style.display = 'block';
    document.getElementById('semesterCalc').style.display = 'none';
    document.getElementById('paymentCalc').style.display = 'none';
    document.getElementById('ageCalc').style.display = 'none';
    document.getElementById('gameCalc').style.display = 'none';
    document.querySelector('.info-btn').style.display = 'block';
    
    // Clear inputs
    document.getElementById('seminarCount').value = '';
    document.getElementById('kollokCount').value = '';
    document.getElementById('serbest').value = '';
    document.getElementById('hourSelect').value = '';
    document.getElementById('absences').value = '';
    document.getElementById('seminarInputs').innerHTML = '';
    document.getElementById('kollokInputs').innerHTML = '';
    document.getElementById('semesterResult').innerHTML = '';
    document.getElementById('yearlyPayment').value = '';
    document.getElementById('creditCount').value = '';
    document.getElementById('paymentResult').innerHTML = '';
    document.getElementById('birthDate').value = '';
    document.getElementById('ageResult').innerHTML = '';
    
    resetGame();
}

// Game Functions
function resetGame() {
    isSpinning = false;
    document.getElementById('spinBtn').disabled = false;
    document.getElementById('choiceButtons').style.display = 'none';
    document.getElementById('questionBox').style.display = 'none';
    const bottle = document.getElementById('bottle');
    bottle.classList.remove('spinning');
    bottle.style.transform = 'rotate(0deg)';
}

function spinBottle() {
    if (isSpinning) return;
    
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('choiceButtons').style.display = 'none';
    document.getElementById('questionBox').style.display = 'none';
    
    const bottle = document.getElementById('bottle');
    bottle.classList.add('spinning');
    
    // After 16 seconds, stop spinning and show choices
    setTimeout(() => {
        bottle.classList.remove('spinning');
        const randomRotation = Math.floor(Math.random() * 360);
        bottle.style.transform = `rotate(${randomRotation}deg)`;
        
        document.getElementById('choiceButtons').style.display = 'flex';
        isSpinning = false;
        document.getElementById('spinBtn').disabled = false;
    }, 16000);
}

function showQuestion(type) {
    const questionBox = document.getElementById('questionBox');
    let question;
    
    if (type === 'truth') {
        question = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
        questionBox.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
        questionBox.innerHTML = `
            <div>
                <div style="font-size: 48px; margin-bottom: 20px;">💭</div>
                <div style="font-size: 28px; font-weight: 800; margin-bottom: 15px;">DOĞRULUQ</div>
                <div style="font-size: 22px; line-height: 1.6;">${question}</div>
            </div>
        `;
    } else {
        question = dareQuestions[Math.floor(Math.random() * dareQuestions.length)];
        questionBox.style.background = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
        questionBox.innerHTML = `
            <div>
                <div style="font-size: 48px; margin-bottom: 20px;">🎯</div>
                <div style="font-size: 28px; font-weight: 800; margin-bottom: 15px;">CƏSARƏT</div>
                <div style="font-size: 22px; line-height: 1.6;">${question}</div>
            </div>
        `;
    }
    
    questionBox.style.display = 'block';
    document.getElementById('choiceButtons').style.display = 'none';
}

// Semester Calculator Functions
function generateSeminarInputs() {
    const count = parseInt(document.getElementById('seminarCount').value);
    const container = document.getElementById('seminarInputs');
    
    if (!count || count < 1 || count > 11) {
        alert('Seminar sayı 1-11 arasında olmalıdır!');
        return;
    }
    
    let html = '<div class="dynamic-inputs">';
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="dynamic-input">
                <label>Seminar ${i}</label>
                <input type="number" id="seminar${i}" min="0" max="10" step="0.1" placeholder="0-10">
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

function generateKollokInputs() {
    const count = parseInt(document.getElementById('kollokCount').value);
    const container = document.getElementById('kollokInputs');
    
    if (!count || count < 1 || count > 4) {
        alert('Kollekvium sayı 1-4 arasında olmalıdır!');
        return;
    }
    
    let html = '<div class="dynamic-inputs">';
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="dynamic-input">
                <label>Kollekvium ${i}</label>
                <input type="number" id="kollok${i}" min="0" max="10" step="0.1" placeholder="0-10">
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

function calculateAttendance(hours, absences) {
    const rules = {
        30: { 10: [0], 9: [1, 2], 8: [3], kesr: 4 },
        45: { 10: [1], 9: [2, 3], 8: [4, 5], kesr: 6 },
        60: { 10: [1], 9: [2, 3, 4], 8: [5, 6, 7], kesr: 8 },
        75: { 10: [1], 9: [2, 3, 4, 5], 8: [6, 7, 8, 9], kesr: 10 },
        90: { 10: [1, 2], 9: [3, 4, 5, 6], 8: [7, 8, 9, 10, 11], kesr: 12 },
        105: { 10: [1, 2], 9: [3, 4, 5, 6, 7], 8: [8, 9, 10, 11, 12, 13], kesr: 14 }
    };
    
    const rule = rules[hours];
    if (!rule) return 0;
    
    if (absences >= rule.kesr) return 'KƏSR';
    if (rule[10].includes(absences)) return 10;
    if (rule[9].includes(absences)) return 9;
    if (rule[8].includes(absences)) return 8;
    return 0;
}

function calculateSemester() {
    const seminarCount = parseInt(document.getElementById('seminarCount').value);
    const kollokCount = parseInt(document.getElementById('kollokCount').value);
    const serbestInput = document.getElementById('serbest').value;
    const hours = document.getElementById('hourSelect').value;
    const absences = parseInt(document.getElementById('absences').value);
    
    if (!seminarCount || !kollokCount) {
        alert('Zəhmət olmasa seminar və kollekvium saylarını yaradın!');
        return;
    }
    
    if (!serbestInput || !hours || absences === '') {
        alert('Zəhmət olmasa bütün məlumatları daxil edin!');
        return;
    }
    
    // Calculate seminar average
    let seminarSum = 0;
    let seminarValid = true;
    for (let i = 1; i <= seminarCount; i++) {
        const value = parseFloat(document.getElementById(`seminar${i}`).value);
        if (isNaN(value) || value < 0 || value > 10) {
            seminarValid = false;
            break;
        }
        seminarSum += value;
    }
    
    if (!seminarValid) {
        alert('Seminar qiymətləri 0-10 aralığında olmalıdır!');
        return;
    }
    
    const seminarAvg = seminarSum / seminarCount;
    
    // Calculate kollok average
    let kollokSum = 0;
    let kollokValid = true;
    for (let i = 1; i <= kollokCount; i++) {
        const value = parseFloat(document.getElementById(`kollok${i}`).value);
        if (isNaN(value) || value < 0 || value > 10) {
            kollokValid = false;
            break;
        }
        kollokSum += value;
    }
    
    if (!kollokValid) {
        alert('Kollekvium qiymətləri 0-10 aralığında olmalıdır!');
        return;
    }
    
    const kollokAvg = kollokSum / kollokCount;
    
    // Validate serbest
    const serbest = parseFloat(serbestInput);
    if (isNaN(serbest) || serbest < 0 || serbest > 10) {
        alert('Sərbəst iş qiyməti 0-10 aralığında olmalıdır!');
        return;
    }
    
    // Calculate attendance
    const attendance = calculateAttendance(parseInt(hours), absences);
    
    if (attendance === 'KƏSR') {
        document.getElementById('semesterResult').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <div class="final-score">KƏSR</div>
                <p style="font-size: 18px;">Davamiyyət səbəbindən kəsr aldınız!</p>
                <p style="margin-top: 15px; font-size: 14px; opacity: 0.9;">
                    <strong>${hours} saat üçün</strong> maksimum qayıb limitini keçdiniz.
                </p>
            </div>
        `;
        return;
    }
    
    // Calculate final score
    const semesterScore = (seminarAvg * 0.4 + kollokAvg * 0.6) * 3;
    const finalScore = semesterScore + attendance + serbest;
    
    // Determine status
    let status = '';
    let emoji = '';
    if (finalScore >= 50) {
        status = '🎉 MÜVƏFFƏQİYYƏTLƏ KEÇDİNİZ!';
        emoji = '✅';
    } else if (finalScore >= 40) {
        status = '⚠️ ORTA NƏTİCƏ';
        emoji = '📊';
    } else if (finalScore > 0) {
        status = '⚠️ AŞAĞI NƏTİCƏ';
        emoji = '📉';
    } else {
        status = '⚠️ 0 BAL';
        emoji = '⚠️';
    }
    
    document.getElementById('semesterResult').innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
            <div class="final-score">${finalScore.toFixed(2)} bal</div>
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 25px;">${status}</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin-top: 20px;">
            <strong>📊 DETALLI NƏTİCƏLƏR:</strong><br><br>
            🎯 Seminar ortalaması: <strong>${seminarAvg.toFixed(2)}</strong><br>
            📝 Kollekvium ortalaması: <strong>${kollokAvg.toFixed(2)}</strong><br>
            🔢 Semestr balı: <strong>${semesterScore.toFixed(2)}</strong><br>
            📚 Sərbəst iş: <strong>${serbest.toFixed(2)}</strong><br>
            ✅ Davamiyyət (${hours} saat, ${absences} qayıb): <strong>${attendance}</strong><br><br>
            <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 15px;">
                <strong>📌 YEKUN BAL: ${finalScore.toFixed(2)} / 50</strong>
            </div>
        </div>
    `;
}

// Payment Calculator
function calculatePayment() {
    const yearlyPayment = parseFloat(document.getElementById('yearlyPayment').value);
    const creditCount = parseFloat(document.getElementById('creditCount').value);
    
    if (!yearlyPayment || !creditCount || yearlyPayment <= 0 || creditCount <= 0) {
        alert('Zəhmət olmasa düzgün məlumatlar daxil edin!');
        return;
    }
    
    const payment = ((yearlyPayment / 60) * creditCount) / 4 + 1;
    
    document.getElementById('paymentResult').innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">💰</div>
            <div class="final-score">${payment.toFixed(2)} AZN</div>
            <div style="font-size: 18px; font-weight: 600; margin-top: 10px;">25% İmtahan Ödənişi</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin-top: 20px;">
            <strong>📊 HESABLAMA DETALLLARI:</strong><br><br>
            💵 İllik ödəniş: <strong>${yearlyPayment.toFixed(2)} AZN</strong><br>
            📚 Kredit sayı: <strong>${creditCount}</strong><br><br>
            <div style="font-size: 14px; opacity: 0.9; line-height: 1.6;">
                Düstur: ((${yearlyPayment} / 60) × ${creditCount}) / 4 + 1 = <strong>${payment.toFixed(2)} AZN</strong>
            </div>
        </div>
    `;
}

// Age Calculator
function calculateAge() {
    const birthDateInput = document.getElementById('birthDate').value;
    
    if (!birthDateInput) {
        alert('Zəhmət olmasa doğum tarixinizi daxil edin!');
        return;
    }
    
    // Parse date (DD.MM.YYYY)
    const parts = birthDateInput.split('.');
    if (parts.length !== 3) {
        alert('Tarix formatı düzgün deyil! Nümunə: 31.12.2000');
        return;
    }
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year) || 
        day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
        alert('Düzgün tarix daxil edin!');
        return;
    }
    
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    // Validate date
    if (birthDate > today) {
        alert('Doğum tarixi gələcəkdə ola bilməz!');
        return;
    }
    
    // Calculate age
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    let ageMonths = today.getMonth() - birthDate.getMonth();
    let ageDays = today.getDate() - birthDate.getDate();
    
    if (ageDays < 0) {
        ageMonths--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        ageDays += prevMonth.getDate();
    }
    
    if (ageMonths < 0) {
        ageYears--;
        ageMonths += 12;
    }
    
    // Calculate total days lived
    const timeDiff = today.getTime() - birthDate.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    // Calculate next birthday
    let nextBirthday = new Date(today.getFullYear(), month - 1, day);
    if (nextBirthday < today) {
        nextBirthday = new Date(today.getFullYear() + 1, month - 1, day);
    }
    
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    // Check if today is birthday
    let birthdayMessage = '';
    if (today.getDate() === day && today.getMonth() === (month - 1)) {
        birthdayMessage = '<div style="font-size: 24px; margin: 20px 0;">🎉 AD GÜNÜNÜZ MÜBARƏK! 🎂</div>';
    }
    
    document.getElementById('ageResult').innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎂</div>
            ${birthdayMessage}
            <div class="final-score">${ageYears} yaş</div>
            <div style="font-size: 18px; margin-top: 10px;">${ageMonths} ay ${ageDays} gün</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin-top: 20px;">
            <strong>📊 DETALLI MƏLUMAT:</strong><br><br>
            🎂 Yaşınız: <strong>${ageYears} il ${ageMonths} ay ${ageDays} gün</strong><br>
            📅 Doğum tarixi: <strong>${day}.${month}.${year}</strong><br>
            ⏰ Bu günə qədər yaşadığınız günlər: <strong>${totalDays.toLocaleString()} gün</strong><br>
            🎈 Növbəti ad gününüzə: <strong>${daysUntilBirthday} gün</strong><br>
            📆 Növbəti ad günü: <strong>${day}.${month}.${nextBirthday.getFullYear()}</strong>
        </div>
    `;
}

// Info Modal Functions
function showInfo() {
    document.getElementById('infoModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeInfo() {
    document.getElementById('infoModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Input formatting for birth date
document.addEventListener('DOMContentLoaded', function() {
    const birthDateInput = document.getElementById('birthDate');
    
    if (birthDateInput) {
        birthDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.substring(0, 2) + '.' + value.substring(2);
            }
            if (value.length >= 5) {
                value = value.substring(0, 5) + '.' + value.substring(5);
            }
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            
            e.target.value = value;
        });
    }
});
