import { filterHolidays } from './Calendar.js';
export async function getHoliday () {
  let data = sessionStorage.getItem('holiday-info');
  if (!!data) {
    data = data.split(';-;');
    const [year, id] = data;
    const filter = await filterHolidays(Number(year));
    return filter[Number(id)];
  }
  return null;
}
export function setHoliday (year, id, curdate) {
  sessionStorage.setItem('holiday-info', `${year};-;${id}`);
  setPreviousTime(curdate);
}
export function setPreviousTime (curdate) {
  sessionStorage.setItem('previous-date', curdate.getTime());
}
export function getPreviousTime () {
  const date = sessionStorage.getItem('previous-date');
  if (!!date) {
    return new Date(Number(date));
  }
  return null;
}