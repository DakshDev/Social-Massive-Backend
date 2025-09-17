enum ErrorType {
  AlreadyExist = "Already Exist",
  DataRequired = "Data Required", // when user passed empty data
  InvalidCredential = "Invalid Credential", // for email and password
  InvalidUsername = "Invalid Username",
  InvalidEmail = "Invalid Email",
  TokenRequired = "Token Required",
  InvalidToken = "Invalid Token",
  ServerError = "Internal Server Error",
}

export default ErrorType;
