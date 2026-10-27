import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as crypto from "crypto";
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import fs from 'fs'

const app = express();
const logger = pino(pinoPretty());

app.use(cors());
app.use(
  bodyParser.json({
    type(req) {
      return true;
    },
  })
);
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ticketsPath = path.join(__dirname, 'data', 'tickets.json');

let tickets;

try {
  const data = fs.readFileSync(ticketsPath, 'utf8');
  tickets = JSON.parse(data);
  logger.info(`Loaded ${tickets.length} tickets from file`);
} catch (error) {
  logger.error(`Failed to load tickets.json: ${error.message}`);
  // Если файла нет или он битый — начнём с дефолтного массива
  tickets = [
    {
      id: 1,
      name: 'Поменять краску в принтере, ком. 404',
      description: 'Принтер HP LJ-1210, картриджи на складе',
      status: false,
      created: Date.now(),
    },
    {
      id: 2,
      name: 'Переустановить Windows, PC-Hall24',
      description: '',
      status: false,
      created: Date.now(),
    },
    {
      id: 3,
      name: 'Установить обновление KB-31642dv3875',
      description: 'Вышло критическое обновление для Windows',
      status: false,
      created: Date.now(),
    },
  ];
}

const saveTickets = () => {
  try {
    fs.writeFileSync(ticketsPath, JSON.stringify(tickets, null, 2), 'utf8');
    logger.debug('Tickets saved to file');
  } catch (err) {
    logger.error('Failed to save tickets.json', err);
  }
};

let stat = 4

app.use(async (request, response) => {
  const { method, id } = request.query;
  switch (method) {
    case "allTickets":
      logger.info('All tickets has been called');
      response.send(JSON.stringify(tickets)).end();
      break;
    case "ticketById": {
      const ticket = tickets.find((ticket) => ticket.id === Number(id));
      if (!ticket) {
        response
          .status(404)
          .send(JSON.stringify({ message: "Ticket not found" }))
          .end();
        break;
      }
      response.send(JSON.stringify(ticket)).end();
      break;
    }
    case "createTicket": {
      try {
        const createData = request.body;
        const newTicket = {
          id: stat,
          name: createData.name,
          status: createData.status,
          description: createData.description || "",
          created: Date.now(),
        };
        tickets.push(newTicket);
        saveTickets()
        stat += 1;
        logger.info(`New ticket created: ${JSON.stringify(newTicket)}`);
        response.send(JSON.stringify(newTicket)).end();
      } catch (error) {
        logger.error(`Error creating new ticket: ${error.message}`);
        response.status(500).send(JSON.stringify({ error: error.message }));
      }
      break;
    }
    case "deleteById": {
      const ticket = tickets.find((ticket) => ticket.id === Number(id));
      if (ticket) {
        tickets = tickets.filter((ticket) => ticket.id !== Number(id));
        saveTickets()
        logger.info(`Ticket deleted: ${JSON.stringify(ticket)}`);
        response.status(204).end();
      } else {
        logger.warn(`Ticket not found: ${id}`);
        response
          .status(404)
          .send(JSON.stringify({ message: "Ticket not found" }))
          .end();
      }
      break;
    }
    
    case "updateById": {
      const ticketId = Number(id);
      const ticket = tickets.find((t) => t.id === ticketId);
      saveTickets()
      const updateData = request.body;

      if (!ticket) {
        logger.warn(`Ticket not found: ${ticketId}`);
        return response.status(404).json({ message: "Ticket not found" });
      }

      // Обновляем только переданные поля
      Object.assign(ticket, updateData);

      logger.info(`Ticket updated: ${JSON.stringify(ticket)}`);
      // Возвращаем обновлённый тикет как JSON
      response.json(ticket);
      break;
    }

    default:
      logger.warn(`Unknown method: ${method}`);
      response.status(404).end();
      break;
  }
});

const port = process.env.PORT || 7070;

const bootstrap = async () => {
  try {
    app.listen(port, () =>
        logger.info(`Server has been started on http://localhost:${port}`)
    );
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
