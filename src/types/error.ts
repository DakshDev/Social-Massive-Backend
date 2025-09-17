enum ErrorType {
  DataRequired = "Data Required", // when user pass empty data
  InvalidCreation = "Invalid Creation",
  InvalidCredential = "Invalid Credential", // for email and password
  InvalidUsername = "Invalid Username",
  TokenRequired = "Token Required",
  InvalidToken = "Invalid Token",
  ServerError = "Internal Server Error",
}

export default ErrorType;
