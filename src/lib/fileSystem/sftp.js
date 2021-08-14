import dialogs from "../../components/dialogs";

class SFTP{
  #host;
  #port;
  #username;
  #authenticationType;
  #password;
  #keyFile;
  #passPhrase;


  /**
   * 
   * @param {String} host 
   * @param {Number} port 
   * @param {String} username 
   * @param {{password?: String, passPhrase?: String, keyFile?: String}} authentication 
   */
  constructor(host, port, username, authentication){

    this.#host = host;
    this.#port = port;
    this.#username = username;
    this.#authenticationType = authentication.keyFile ? 'key' : 'password';
    this.#keyFile = authentication.keyFile;
    this.#passPhrase = authentication.passPhrase;
    this.#password = authentication.password;

  }

  connect(){
    return new Promise((resolve, reject)=>{
      dialogs.loader('Connecting to SFTP...');

      if(this.#authenticationType === 'key'){
        sftp.connectUsingKeyFile(
          this.#host, 
          this.#port,
          this.#username, 
          this.#keyFile, 
          this.#passPhrase,
          ()=>{
            resolve();
            dialogs.loader.hide();
          },
          err=>reject(err)
        );
        return;
      }
        
      sftp.connectUsingKeyFile(
        this.#host, 
        this.#port,
        this.#username, 
        this.#password,
        ()=>{
          resolve();
          dialogs.loader.hide();
        },
        err=>reject(err)
      );

    });
  }

  ls(dirname){
    return new Promise((resolve, reject)=>{

      (async ()=>{

        sftp.isConnected(res=>{
          if(!res){
            await this.connect();
          }
    
          sftp.exec('ls -lahAG --full-time', res=>{
            const dirList = this.#parseDir(res);
            resolve(dirList);
          }, err=>{
            reject(err);
          });
        }, err=>{
          throw new Error(err);
        });

      })();

    });
  }


  /**
   * 
   * @param {String} res 
   */
  #parseDir(res){

    const PERMISSIONS = 0;
    const SIZE = 2;
    const MODIFIED = 5;
    const NAME = 8;

    const list = res.split('\n');
    const files = [];
    list.splice(0, 1);

    list.forEach(item=>{
      const itemData = item.split(' ');
    });
  }

}