const fs = require('fs')

let tickets = [
  {
    id: 1,
    name: "Поменять краску в принтере, ком. 404",
    description: "Принтер HP LJ-1210, картриджи на складе",
    status: false,
    created: Date.now(),
  },
  {
    id: 2,
    name: "Переустановить Windows, PC-Hall24",
    description: "",
    status: false,
    created: Date.now(),
  },
  {
    id: 3,
    name: "Установить обновление KB-31642dv3875",
    description: "Вышло критическое обновление для Windows",
    status: false,
    created: Date.now(),
  },
];

tickets.forEach(rty => {
    console.log(rty.id)
})

// const jsonString = JSON.stringify(tickets)

// fs.writeFile('./data/tickets.json', jsonString, (err) => {
//   if (err) {
//     console.log('error:', err)
//     return
//   }
//   console.log('OK')
// })

// fetch('./data/tickets.json')
//   .then(response => response.json())
//   .then(data => {
//     console.log('данные:', data) 
//   })
//   .catch(error => {
//     console.error("Ошибка", error)
//   })