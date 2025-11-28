const formatDate = (date: string) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const formatDateTime = (dateString: string) => {
  if (/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return dateString;
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.error("Invalid date string:", dateString);
    return dateString;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

const getCurrentISOString = () => {
  return new Date().toISOString();
};

export { formatDate, formatDateTime, getCurrentISOString };
