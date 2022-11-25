const userDto = (model) => {
  return {
    email: model.email,
    id: model._id,
    isActivated: model.isActivated,
  };
};

module.exports = userDto;
