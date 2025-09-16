enum ErrorType {
  DataRequired = "Data Required", // when user pass empty data
  InvalidCreation = "Invalid Creation",
  InvalidCredential = "Invalid Credential", // for email and password
  InvalidUsername = "Invalid Username",
  ServerError = "Internal Server Error",
}

export default ErrorType;
