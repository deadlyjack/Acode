interface Ftp{
  connect(
    hostname: String, 
    username: String, 
    password: String, 
    type: String, 
    mode: 'ftp' | 'ftps', 
    successCallback: ()=>void, 
    errorCallback: ()=>void
  ): void;
}

declare var ftp: Ftp;