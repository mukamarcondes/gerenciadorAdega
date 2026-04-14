const { routeRequest } = require("./_lib/core");

module.exports = async function handler(req, res) {
  try {
    const result = await routeRequest(req);

    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value);
      }
    }

    if (result.body) {
      res.setHeader("Content-Type", result.contentType || "application/octet-stream");
      res.status(result.status || 200).send(result.body);
      return;
    }

    res.status(result.status || 200).json(result.json || {});
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Erro interno do servidor.";
    if (status >= 500) {
      console.error(error);
    }
    res.status(status).json({ error: message });
  }
};
