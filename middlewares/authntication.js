const { isTokenValid } = require("../utils");
const CustomError = require("../errors");
const authenticateUser = async (req, res, next) => {
  // const token = req.signedCookies.token;
  // // console.log(token);
  // if (!token) {
  //   throw new CustomError.UnauthenticatedError("Invalid token provided");
  // }
  const AuthorizationHeader = req.headers.authorization;
  // console.log(AuthorizationHeader);
  if (!AuthorizationHeader || !AuthorizationHeader.startsWith("Bearer")) {
    throw new CustomError.UnauthenticatedError("Invalid authentication xx");
  }
  const token = AuthorizationHeader.split(" ")[1];
  try {
    const { username, role, userId } = isTokenValid({ token });
    req.user = { username, role, userId };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Invalid authentication x");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "Not authorized to access this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
