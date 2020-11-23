import { setHoliday, getPreviousTime, setPreviousTime } from './SessionStorage.js';
export default class Calendar {
  constructor () {
    this.now = new Date();
    this._months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.monthDisplay = document.querySelector(".date .month");
    this.yearDisplay = document.querySelector(".date .year");
    this.daysDisplay = document.getElementById("daysDisplay");
    this.holidayDisplay = document.getElementById("holiday-list");
    this.currentDate = (!!getPreviousTime()) ? getPreviousTime() : new Date(this.now.getTime());
    this.days = [];
    this._bufferYear = null;
    this.holidays = null;
    this.Render();
  }
  
  async Render () {
    await this.setHolidays();
    this.daysDisplay.innerHTML = '';
    this.holidayDisplay.innerHTML = '';
    this.yearDisplay.innerHTML = this.currentDate.getFullYear();
    this.monthDisplay.innerHTML = this._months[this.currentDate.getMonth()];
    let firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    let lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    this.days = [];
    for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
      let isToday = false;
      let description = null;
      let day = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
      if (this.currentDate.getFullYear() === this.now.getFullYear() && this.currentDate.getMonth() === this.now.getMonth() && this.now.getDate() === i) {
        isToday = true;
      }
      let index = this.holidays.map(e => e.date.toDateString()).indexOf(day.toDateString());
      let Index = null;
      if (index !== -1) {
        Index = index;
        description = this.holidays[index].name;
        let holidayCard = new HolidayCard(this.holidays[index].name, this.holidays[index].date, this.holidays[index].type, index).ToHtmlNode();
        this._addEvent(holidayCard, index);
        this.holidayDisplay.appendChild(holidayCard);
      }
      this.days.push(new Day(i, description, isToday, null, Index));
    }
    if (firstDay.getDay() !== 0) {
      let lastMonth = new Date(firstDay.getTime());
      lastMonth.setDate(0);//01/10/2020 => 30/09/2020
      while (lastMonth.getDay() !== 6) {
        this.days.unshift(new Day(lastMonth.getDate(), null, false, true));
        lastMonth.setDate(lastMonth.getDate()-1);
      }
    }
    if (lastDay.getDay() !== 6) {
      let nextMonth = new Date(lastDay.getTime());
      nextMonth.setDate(nextMonth.getDate()+1);//31/10/2020 => 01/11/2020
      while (nextMonth.getDay() !== 0) {
        this.days.push(new Day(nextMonth.getDate(), null, false, true));
        nextMonth.setDate(nextMonth.getDate()+1);
      }
    }
    this.days.forEach(e => {
      const node = e.ToHtmlNode();
      if (e.Description) {
        this._addEvent(node, e.Id);
      }
      this.daysDisplay.appendChild(node)
    });
  }

  async setHolidays () {
    if (!this._bufferYear || this._bufferYear !== this.currentDate.getFullYear()) {
      this.holidays = await mapHolidays(this.currentDate.getFullYear());
      this._bufferYear = this.currentDate.getFullYear();
    }
  }

  ChangeMonth (index/*int, relativo ao atual*/) {
    this.currentDate.setMonth(this.currentDate.getMonth() + index);
    setPreviousTime(this.currentDate);
    this.Render();
  }

  set Date (date) {
    this.currentDate = date;
    this.Render();
  }

  NextMonth () {
    this.ChangeMonth(1);
  }
  
  PreviousMonth () {
    this.ChangeMonth(-1);
  }

  _addEvent (node/*HTMLElement*/, id/*int*/) {
    node.addEventListener("click", () => {
      setHoliday(this.currentDate.getFullYear(), id, this.currentDate);
      window.location.href = "./ver-feriado.html";
    });
  }
}

class Day {
  constructor (number/*int*/, description/*string*/, today/*bool*/, other/*bool*/, id/*int*/) {
    this.Number = number;//número do dia
    this.Description = (other) ? null : description;//descrição do dia (caso ele seja um feriado dentro do mês)
    this.Other = other;//indicador que o dia é de outro mês
    this.IsToday = today;
    this.Id = id;//id do feriado, caso haja um
  }
  ToHtmlNode () {
    let node = document.createElement("div");
    let number = document.createElement("p");
    number.appendChild(document.createTextNode(this.Number));
    number.classList.add("day");
    node.appendChild(number);
    if (this.IsToday) {
      node.classList.add("current-day");
    }
    if (this.Description) {
      node.classList.add("holiday");
      let description = document.createElement("p");
      description.classList.add("description");
      description.appendChild(document.createTextNode(this.Description));
      node.appendChild(description);
      node.setAttribute("holiday-id", this.Id);
    }
    if (this.Other) {
      node.setAttribute("class", "other-month");
    }
    return node;
  }
}

class HolidayCard {
  constructor (name/*string*/, day/*Date*/, type/*string*/, id/*int*/) {
    this.Name = name;
    this.Day = day;
    this.Type = type;
    this.Id = id;
  }
  ToHtmlNode () {
    let node = document.createElement('p');
    let dateString = `${this.Day.getDate()}/${this.Day.getMonth()+1}`;
    node.appendChild(document.createTextNode(`${dateString} - ${this.Name} (${this.Type})`));
    node.setAttribute("holiday-id", this.Id);
    return node;
  }
}


export async function fetchHolidays (year) {
  const url = `https://api.calendario.com.br/?json=true&ano=${year}&ibge=3541000&token=YWZvbnNpbmhvLmFicmV1QGdtYWlsLmNvbSZoYXNoPTMwMTU2NzEx`;
  const response = await fetch(url);
  if (!response.ok) {
    alert("Não foi possível requisitar os feriados, o calendário irá rodar sem eles...");
    return null;
  }
  return await response.json();
}

export async function mapHolidays (year) {
  const array = await filterHolidays(year);
  return array.map(e => {
    let date = e.date.split("/");
    return {
      date: new Date(date[2], date[1]-1, date[0]),
      name: e.name,
      type: e.type,
    };
  });
}

export async function filterHolidays (year) {
  const rawHolidays = await fetchHolidays(year);
  return rawHolidays.filter(e => {
    if (e.type_code == 1 || e.type_code == 2 || e.type_code == 3) {
      return e;
    }
  })
}