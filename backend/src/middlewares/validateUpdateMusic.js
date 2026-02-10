export const validateUpdateMusic = (req, res, next) => {
  const { title, artist, url } = req.body;

  // Verifica se o body está vazio
  if (!title && !artist && !url) {
    return res.status(400).json({
      message: "Envie pelo menos um campo para atualizar"
    });
  }

  // Se vier campo, não pode ser vazio
  if (title !== undefined && !title.trim()) {
    return res.status(400).json({
      message: "Title não pode ser vazio"
    });
  }

  if (artist !== undefined && !artist.trim()) {
    return res.status(400).json({
      message: "Artist não pode ser vazio"
    });
  }

  if (url !== undefined && !url.trim()) {
    return res.status(400).json({
      message: "URL não pode ser vazio"
    });
  }

  next();
};
