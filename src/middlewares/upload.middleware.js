export function uploadSingle(fieldName) {
  return (req, res, next) => {
    next();
  };
}

export function uploadMultiple(fieldName, maxCount = 1) {
  return (req, res, next) => {
    next();
  };
}
