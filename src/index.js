const { PORT } = require("./config");
const { createAppServer } = require("./server");

const server = createAppServer();

server.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
