import { WebSocket, WebSocketServer } from "ws";

// Singleton pattern para garantir que o servidor seja criado apenas uma vez
let wss: WebSocketServer | null = null;

function getWebSocketServer(): WebSocketServer {
  if (!wss) {
    const port = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 8080;
    wss = new WebSocketServer({ port });

    wss.on("listening", () => {
      console.log(`[WebSocket Server] Servidor iniciado na porta ${port}`);
    });

    wss.on("connection", (ws: WebSocket) => {
      console.log("[WebSocket Server] Nova conexão estabelecida");

      ws.on("close", () => {
        console.log("[WebSocket Server] Conexão fechada");
      });

      ws.on("error", (error) => {
        console.error("[WebSocket Server] Erro na conexão:", error);
      });
    });

    wss.on("error", (error) => {
      console.error("[WebSocket Server] Erro no servidor:", error);
    });
  }
  return wss;
}

// Função para broadcast de atualizações de tickets
export function broadcastTicketUpdate(data: {
  type: "ticket-created" | "ticket-updated";
  ticketId?: string;
}) {
  try {
    const server = getWebSocketServer();
    const payload = JSON.stringify({
      type: data.type,
      ticketId: data.ticketId,
    });

    let sentCount = 0;
    server.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
          sentCount++;
        } catch (error) {
          console.error("[WebSocket Server] Erro ao enviar mensagem:", error);
        }
      }
    });

    if (sentCount > 0) {
      console.log(
        `[WebSocket Server] Evento "${data.type}" enviado para ${sentCount} cliente(s)`,
      );
    }
  } catch (error) {
    console.error("[WebSocket Server] Erro no broadcast:", error);
  }
}

// Inicializar o servidor quando o módulo for importado
getWebSocketServer();

// Exportar função para obter o servidor (garante que sempre retorna uma instância)
export default getWebSocketServer;
