if (Math.random() > 0.5) {
  console.error("Failure occurred!");

  throw new Error();
}

console.log("Success!");
