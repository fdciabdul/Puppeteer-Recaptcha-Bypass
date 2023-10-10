module.exports = function rdn(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  };
  