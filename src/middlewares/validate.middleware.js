export function validateBody(requiredFields = []) {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => req.body[field] === undefined);
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missingFields.join(", ")}` });
    }
    next();
  };
}

export function validateParams(requiredParams = []) {
  return (req, res, next) => {
    const missingParams = requiredParams.filter((param) => req.params[param] === undefined);
    if (missingParams.length > 0) {
      return res.status(400).json({ success: false, message: `Missing required params: ${missingParams.join(", ")}` });
    }
    next();
  };
}
