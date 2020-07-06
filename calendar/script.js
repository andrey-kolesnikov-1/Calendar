let days = document.querySelector('.days');
let infoMonth = document.querySelector('.infoLabel');
let header = document.querySelector('.header');
let arrows = header.querySelectorAll('.btn');
let modalWindow = document.querySelector('.modal');
let text = document.querySelector('.text');
let divBtnModal = document.querySelector('.modal_btn');
let btnModal = document.querySelectorAll('.m_btn');
let toolTip = document.querySelector('.tooltip');
let currentDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
};
let arrNotes = [];
let thisDay;
let index;
let objectDay;

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

///////////////////////////////////////////////////////////////////////////////////////
// обработка кнопок переключения даты
header.addEventListener('click', (event) => {
    arrows.forEach((value, key) => {
        if (event.target.closest('.btn') == value) {
            if (key === 0) prevMonth();
            if (key === 1) nextMonth();
        }
    });
});

// обработка нажатия на конкретный день месяца
days.addEventListener('click', (event) => {
    disableToolTip();
    let numDay = days.querySelectorAll('.day');
    numDay.forEach((value, key) => {
        if (event.target.closest('.day') == value) {
            text.value = '';
            text.placeholder = '';
            index = key + 1;
            objectDay = value;
            arrNotes.forEach((val) => {
                if (val.fullDay === Notes.mathFullDay(currentDate.year, currentDate.month, index)) {
                    text.value = val.note;
                }
            });
            modalWindow.classList.add('modal_view');
            text.focus();
        }
    });
});

// обработка появления подсказки о заметках при наведении курсора мыши на день месяца
days.addEventListener('mouseover', (event) => {
    let numDay = days.querySelectorAll('.day');
    numDay.forEach((value, key) => {
        if (event.target.closest('.day') == value) {
            arrNotes.forEach((val) => {
                if (val.fullDay === Notes.mathFullDay(currentDate.year, currentDate.month, key + 1)) {
                    let tooltipElem = document.querySelector('.tooltip');
                    tooltipElem.style.display = 'block';
                    let noteText = document.querySelector('.tooltiparea');

                    let text = '';
                    val.note.split('\n').forEach((str) => {
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
            });
        }
    });
});

// обработка скрытия подсказки при убирании курсора мыши с дня месяца
days.addEventListener('mouseout', (event) => {
    let numDay = days.querySelectorAll('.day');
    numDay.forEach((value) => {
        if (event.target == value) {
            disableToolTip();
        }
    });
});

// исчезание окна подсказки
function disableToolTip() {
    toolTip.style.display = 'none';
}

// обработка нажатия на кнопки модального окна (появляется при клике на дни месяца)
divBtnModal.addEventListener('click', (event) => {
    btnModal.forEach((value, key) => {
        if (event.target == value) {
            switch (key) {
                case 0: // нажата кнопка "Удалить"
                    arrNotes.forEach((value, i) => {
                        if (value.fullDay === Notes.mathFullDay(currentDate.year, currentDate.month, index)) {
                            arrNotes.splice(i, 1);
                            objectDay.classList.remove('select_day');
                        }
                    });
                    closeModal();
                    break;
                case 1: // нажата кнопка "Отмена"
                    closeModal();
                    break;
                case 2: // нажата кнопка "Принять"
                    if (text.value.trim() === '') {
                        text.value = '';
                        text.placeholder = 'Заметка не должна быть пустой.';
                        text.focus();
                    } else {
                        let note = new Notes(currentDate.year, currentDate.month, index, text.value);
                        arrNotes.forEach((value, i) => {
                            if (value.fullDay === note.fullDay) {
                                arrNotes.splice(i, 1);
                            }
                        });
                        arrNotes.push(note);
                        objectDay.classList.add('select_day');
                        closeModal();
                    }
                    break;
            }
        }
    });
});

// функция закрытия модального окна
function closeModal() {
    modalWindow.classList.remove('modal_view');
    modalWindow.classList.add('modal_not_view');
    setTimeout(() => {
        modalWindow.classList.remove('modal_not_view');
    }, 400);
}

// функция переключения на один месяц назад
function prevMonth() {
    currentDate.month -= 1;
    createDays(date(currentDate));
}

// функция переключения на один месяц вперёд
function nextMonth() {
    currentDate.month += 1;
    createDays(date(currentDate));
}

// функция определения количества дней в месяце заданной даты и определение текущего месяца
function date(obj, day = 0) {
    let d = new Date(obj.year, obj.month, day);
    let a = new Date();
    (a.getFullYear() === obj.year && a.getMonth() + 1 === obj.month) ? thisDay = true: thisDay = false;
    setInfoMonth(d);
    return d.getDate();
}

// функция вывода названия месяца и года в заголовок календаря
function setInfoMonth(d) {
    let month = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    infoMonth.textContent = `${month[d.getMonth()]} ${d.getFullYear()}`
}

// функция генерации и вывода дней месяца
function createDays(d) {
    let day = document.querySelectorAll('.day');
    day.forEach((value) => {
        value.remove();
    })

    let el, label, currDay = new Date().getDate();
    for (let i = 1; i <= d; i++) {
        el = document.createElement("div");
        el.classList = 'day';
        label = document.createElement("label");
        label.textContent = '' + (i);
        if (thisDay && i === currDay) {
            label.style.color = 'red';
            el.classList.add('currentDay');
        }
        arrNotes.forEach((value) => {
            if (Notes.mathFullDay(currentDate.year, currentDate.month, i) === value.fullDay) {
                el.classList.add('select_day');
            }
        });
        el.appendChild(label);
        days.appendChild(el);
    }
}

disableToolTip();
createDays(date(currentDate));