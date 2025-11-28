"use server";

interface Cliente {
  name: string;
  sector: string;
}

/**
 * Envia dados da chamada para o servidor HTTP/WebSocket
 * @param cliente - Dados do cliente que está sendo chamado (objeto único ou array)
 */
export async function sendToPanel(cliente: Cliente | Cliente[]) {
  try {
    const panelApiUrl = process.env.PANEL_API_URL;
    if (!panelApiUrl) {
      console.warn("PANEL_API_URL não está definido no .env");
      return;
    }

    const baseUrl = panelApiUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/call`;

    // Suporta tanto objeto único quanto array
    const payload = Array.isArray(cliente)
      ? cliente.map((c) => ({
          name: c.name,
          sector: c.sector,
        }))
      : { name: cliente.name, sector: cliente.sector };

    console.log("[WebSocket Server] Enviando para:", apiUrl);
    console.log(
      "[WebSocket Server] Payload:",
      JSON.stringify(payload, null, 2),
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error(
        `[WebSocket Server] Erro ao enviar dados: ${response.status} ${response.statusText}`,
        errorText,
      );
    } else {
      const responseData = await response.json().catch(() => null);
      console.log(
        "[WebSocket Server] Dados enviados com sucesso:",
        responseData,
      );
    }
  } catch (error) {
    console.error("[WebSocket Server] Erro ao enviar dados:", error);
    if (error instanceof Error) {
      console.error("[WebSocket Server] Stack trace:", error.stack);
    }
  }
}
