const app = require("./server/app");

const PORT = process.env.PORT || 3055

const server = app.listen(PORT, () => {
  console.log(`WSV Ecommerce start with port ${PORT}`)
})


process.on('SIGINT', () => {
  server.close(() => console.log(`Exit Server Express`))
  // notify.send(ping...)
})