import { getHoliday } from './SessionStorage.js';
async function setup () {
  const holiday = await getHoliday();
  if (!holiday) {
    location.href = "./";
  }
  const name = document.getElementById('name');
  const date = document.getElementById('date');
  const type = document.getElementById('type');
  const description = document.getElementById('description');
  const link = document.getElementById('link');
  
  name.innerHTML = holiday.name;
  date.innerHTML = holiday.date;
  type.innerHTML = holiday.type;
  description.innerHTML = holiday.description;
  link.href = holiday.link
  if (!holiday.link) {
    link.style.display = "none";
  }
}
setup();