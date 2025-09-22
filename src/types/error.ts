enum ErrorType {
  // Data
  DataRequired = "Data Required",
  InvalidData = "Invalid Data",
  InvalidCredential = "Invalid Credential",
  ManyRequest = "Request already in progress",
  // User
  InvalidUsername = "Invalid Username",
  InvalidEmail = "Invalid Email",
  InvalidAge = "User must be at least 16 years old",
  // Files
  FileError = "File couldn't upload",
}

export enum FileErr {
  UploadError = "File couldn't upload",
  InvalidFile = "Invalid File",
}
export default ErrorType;
