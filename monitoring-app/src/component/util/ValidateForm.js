const validateInput = (name, value, userSchema) => {
  try {
    userSchema.validateSyncAt(name, { [name]: value });
    return { name, error: "" };
  } catch (error) {
    return { name, error: error.message };
  }
};

const validateAllInputs = async (data, userSchema, setErrors) => {
  const validationResults = await Promise.all(
    Object.keys(data).map(async (name) =>
      validateInput(name, data[name], userSchema)
    )
  );

  const errors = validationResults.reduce((acc, { name, error }) => {
    if (error) {
      acc[name] = error;
    }
    return acc;
  }, {});

  setErrors(errors);

  return errors;
};

export { validateInput, validateAllInputs };
