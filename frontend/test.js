import http from "http";

http.createServer((req, res) => {
  res.write("Server working");
  res.end();
}).listen(5000);

console.log("SERVER RUNNING AT https://lifelink-3-nk8d.onrender.com/");