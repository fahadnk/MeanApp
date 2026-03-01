export const diffObjects = (oldObj, newObj, allowedFields = []) => {
  const changes = {};

  for (const field of allowedFields) {
    if (
      newObj[field] !== undefined &&
      oldObj[field]?.toString() !== newObj[field]?.toString()
    ) {
      changes[field] = {
        from: oldObj[field],
        to: newObj[field],
      };
    }
  }

  return changes;
};
