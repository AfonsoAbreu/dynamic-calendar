import Calendar from './Calendar.js';
const calendar = new Calendar();

document.getElementById('next').addEventListener('click', () => calendar.NextMonth());
document.getElementById('previous').addEventListener('click', () => calendar.PreviousMonth());