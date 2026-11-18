// One small shared handler keeps database errors consistent across controllers.
export default function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.code === 11000) {
    return res.status(409).json({
      message: "A user with that username or email already exists.",
    });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed. Check required fields and allowed values.",
      fields: Object.keys(error.errors),
    });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ message: "A field has an invalid value." });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON. Check quotes and commas." });
  }
  if (error.type === "entity.too.large") {
    return res.status(400).json({ message: "JSON body must be smaller than 100 KB." });
  }

  // Do not print raw errors: connection messages can contain private information.
  console.error("An unexpected API error occurred. Check database availability.");
  return res.status(500).json({ message: "Unexpected server error. Please try again." });
}
