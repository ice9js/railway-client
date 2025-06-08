console.log("Starting 5-minute job...");

for (let i = 0; i < 30; i++) {
  console.log(`Processing... ${i + 1}/30`);
  await new Promise((res) => setTimeout(res, 10000)); // 10 seconds
}

console.log("Completed successfully.");
