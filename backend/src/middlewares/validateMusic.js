export const validateMusic = (req, res, next) => {
  const { title, artist, url } = req.body;

  if (
    !title?.trim() ||
    !artist?.trim() ||
    !url?.trim()
  ) {
    return res.status(400).json({
      message: "Title, artist e url são obrigatórios"
    });
  }

  next(); // se passou na validação, continua
};
