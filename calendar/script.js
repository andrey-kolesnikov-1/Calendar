let days = document.querySelector('.days'),
    infoMonth = document.querySelector('.infoLabel'),
    header = document.querySelector('.header'),
    arrows = header.querySelectorAll('.btn'),
    modalWindow = document.querySelector('.modal'),
    text = document.querySelector('.text'),
    toolTip = document.querySelector('.tooltip'),
    currentDate = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    },
    thisDay,
    index,
    objectDay,
    mapNotes = new Map(),
    mapWeekend = new Map(),
    selectedDay;

class Notes { // класс для работы с заметками
    constructor(year, month, day, note = '') {
        this.year = year;
        this.month = month;
        this.day = day;
        this.fullDay = this.getFullDay();
        this.note = note;
    }
    getFullDay() {
        return this.year * 365 + this.month * 31 + this.day;
    }
    static mathFullDay(year, month, day) {
        return year * 365 + month * 31 + day;
    }
}

const localMapKey = 'map',
    localWriteKey = 'write_flag',
    localNotesKey = 'notes',
    gistYear = 5, // 
    tempData = {
        year: new Date().getFullYear() - gistYear,
        month: new Date().getMonth() + 1
    };

if (localStorage.getItem(localNotesKey) !== null) {
    mapNotes = new Map(JSON.parse(localStorage.getItem(localNotesKey)));
}
///////////////////////////////////////////////////////////////////////////////////////

function statusDay(url) {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            resolve(xhr.response);
        };
        xhr.send();
    });
}

function converterDateToStr(date) {
    return ('' + date).length < 2 ? '0' + date : '' + date;
}

async function weekend(date) {
    let selectDate = new Date(date.year, date.month, 0);
    const arr = [];
    for (let i = 1; i <= selectDate.getDate(); i++) {
        let url = `https://isdayoff.ru/${selectDate.getFullYear()}${converterDateToStr(selectDate.getMonth() + 1)}${converterDateToStr(i)}?cc=ua`;
        await statusDay(url).then((data) => {
            arr[i] = data;
        });
    }
    return arr;
}

// заполняем массив месяцами с отмечанными выходными днями
// выборка годов +- 5 лет от текущей даты
async function parseWeekend() {
    const mapWeekend = new Map(); // список выходных дней
    for (let i = 1; i <= 24 * gistYear; i++) {
        await weekend(tempData).then((data) => {
            mapWeekend.set(tempData.year * 12 + tempData.month, data);
        });
        tempData.month += 1;
        document.querySelector('progress').value = (100 * i) / (24 * gistYear);
    }
    return mapWeekend;
}

function getMapWeekend() {
    if (localStorage.getItem(localWriteKey) === 'true') {
        document.querySelector('.progressDiv').style.display = 'none';
        let strMap = localStorage.getItem(localMapKey);
        mapWeekend = new Map(JSON.parse(strMap));
    }
}

if (localStorage.getItem(localWriteKey) === null) {
    parseWeekend().then((data) => {
        let strMap = JSON.stringify([...data]); // Преобразовываем Map в массив, а затем в строку для хранения в локалбном хранилище
        localStorage.setItem(localMapKey, strMap); // сохраняем в памяти
        localStorage.setItem(localWriteKey, 'true'); // выставляем флаг сохранения данных
        getMapWeekend();
        createDays();
    });
}

///////////////////////////////////////////////////////////////////////////////////////

// обработка кнопок переключения даты
header.addEventListener('click', (event) => {
    arrows.forEach((value, key) => {
        if (event.target.closest('.btn') == value) {
            key === 0 ? prevMonth() : nextMonth();
        }
    });
});

// функция переключения на один месяц назад
function prevMonth() {
    currentDate.month -= 1;
    createDays();
}

// функция переключения на один месяц вперёд
function nextMonth() {
    currentDate.month += 1;
    createDays();
}

// обработка нажатия на конкретный день месяца
days.addEventListener('click', (event) => {
    disableToolTip();
    let numDay = days.querySelectorAll('.day');
    numDay.forEach((value, key) => {
        if (event.target.closest('.day') == value) {
            modalWindow.classList.add('modal_view');
            text.value = '';
            text.placeholder = '';
            text.focus();
            index = key + 1;
            objectDay = value;
            selectedDay = Notes.mathFullDay(currentDate.year, currentDate.month, index);
            if (mapNotes.has(selectedDay)) {
                text.value = mapNotes.get(selectedDay).note;
            }
        }
    });
});

// обработка появления подсказки о заметках при наведении курсора мыши на день месяца
days.addEventListener('mouseover', (event) => {
    let numDay = days.querySelectorAll('.day');
    numDay.forEach((value, key) => {
        if (event.target.closest('.day') == value) {
            let index = Notes.mathFullDay(currentDate.year, currentDate.month, key + 1);
            if (mapNotes.has(index)) {
                let tooltipElem = document.querySelector('.tooltip');
                tooltipElem.style.display = 'block';
                let noteText = document.querySelector('.tooltiparea');

                let text = '';
                mapNotes.get(index).note.split('\n').forEach((str) => {
                    text = text + str + '<br>';
                });
                noteText.innerHTML = text;

                // спозиционируем его сверху от аннотируемого элемента (top-center)
                let coords = value.getBoundingClientRect();
                let left = coords.left + (value.offsetWidth - tooltipElem.offsetWidth) / 2;
                if (left < 0) left = 0; // не заезжать за левый край окна
                let top = coords.top - tooltipElem.offsetHeight - 5;
                if (top < 0) { // если подсказка не помещается сверху, то отображать её снизу
                    top = coords.top + value.offsetHeight + 5;
                }
                tooltipElem.style.left = left + 'px';
                tooltipElem.style.top = top + 'px';
            }
        }
    });
});

// обработка скрытия подсказки при убирании курсора мыши с дня месяца
days.addEventListener('mouseout', () => {
    disableToolTip();
});

// исчезание окна подсказки
function disableToolTip() {
    toolTip.style.display = 'none';
}

// нажата кнопка "Удалить"
document.getElementById('btnDelete').addEventListener('click', () => {
    mapNotes.delete(selectedDay);
    saveMapNotes();
    objectDay.classList.remove('select_day');
    objectDay.classList.remove('select_day_currentDay');
    closeModal();
});

// нажата кнопка "Отмена"
document.getElementById('btnCancel').addEventListener('click', () => {
    closeModal();
});

// нажата кнопка "Принять"
document.getElementById('btnApply').addEventListener('click', () => {
    if (text.value.trim() === '') {
        text.value = '';
        text.placeholder = 'Заметка не должна быть пустой.';
        text.focus();
    } else {
        let note = new Notes(currentDate.year, currentDate.month, index, text.value);
        mapNotes.set(selectedDay, note);
        objectDay.classList.add('select_day');
        saveMapNotes();
        createDays();
        closeModal();
    }
});

// фунция сохранения карты заметок в локальном хранилище
function saveMapNotes() {
    let strMap = JSON.stringify([...mapNotes]); // Преобразовываем Map в массив, а затем в строку для хранения в локалбном хранилище
    localStorage.setItem(localNotesKey, strMap); // сохраняем в памяти
}

// функция закрытия модального окна
function closeModal() {
    modalWindow.classList.replace('modal_view', 'modal_not_view');
    setTimeout(() => {
        modalWindow.classList.remove('modal_not_view');
    }, 400);
}

// функция определения количества дней в месяце заданной даты и определение текущего месяца
function date(obj) {
    let selectDate = new Date(obj.year, obj.month, 0),
        currentDate = new Date(),
        month = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    thisDay = currentDate.getFullYear() === obj.year && currentDate.getMonth() + 1 === obj.month;
    infoMonth.textContent = `${month[selectDate.getMonth()]} ${selectDate.getFullYear()}`;
    return selectDate.getDate();
}

// функция генерации и вывода дней месяца
function createDays() {
    let day = document.querySelectorAll('.day');
    day.forEach((value) => {
        value.remove();
    });

    let el,
        label,
        currentDay = new Date().getDate(),
        monthDays = date(currentDate);

    for (let i = 1; i <= monthDays; i++) {
        el = document.createElement('div');
        el.classList = 'day';
        label = document.createElement('label');
        label.textContent = '' + (i);
        if (thisDay && i === currentDay) {
            label.style.color = 'red';
            el.classList.add('currentDay');
            if (mapNotes.has(Notes.mathFullDay(currentDate.year, currentDate.month, i))) {
                el.classList.add('select_day_currentDay');
            }
        }
        if (mapNotes.has(Notes.mathFullDay(currentDate.year, currentDate.month, i))) {
            el.classList.add('select_day');
        }
        if (localStorage.getItem(localWriteKey) === 'true') {
            let days = mapWeekend.get(currentDate.year * 12 + currentDate.month);
            (days !== undefined && days[i] === '1') ? el.classList.add('holiday_day'): el.classList.remove('holiday_day');
        }
        el.appendChild(label);
        days.appendChild(el);
    }
}

getMapWeekend();
disableToolTip();
createDays();