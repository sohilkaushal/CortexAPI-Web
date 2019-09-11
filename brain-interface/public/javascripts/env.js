console.log('File loaded');

const startInterface = () => {
  console.log('called api');
  $.get('/start', (data, status) => {
    console.log(`Data: ${data}\r\n` + `Status: ${status}`);
  });
};

const stopInterface = () => {
  console.log('called api');
  $.get('/stop', (data, status) => {
    console.log(`Data: ${data}\r\n` + `Status: ${status}`);
  });
};

// setInterval(startInterface , duration);

const startAndStop = () => {
  let duration = document.getElementById('duration');
  duration = parseInt(duration.value);
  duration *= 1000;
  console.log(duration);

  if (isNaN(duration)) alert('null value detected put a valid input');
  startInterface();
  setTimeout(stopInterface, duration);
};
