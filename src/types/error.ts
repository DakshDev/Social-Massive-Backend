enum ErrorType {
  // Data
  FieldsRequired = "Fields Required",
  InvalidData = "Invalid Data Passed",
  ManyRequest = "Request already in progress",
  // User
  InvalidCredential = "Invalid Credential",
  InvalidUsername = "Invalid Username",
  UserNotFound = "User Not Found",
  InvalidEmail = "Invalid Email",
}
export default ErrorType;
