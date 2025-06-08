let seconds = 0;

console.log("Persistent worker started...");

setInterval(() => {
  seconds += 15;
  console.log(`Uptime: ${seconds}s`);
}, 15000);
