import config from './config';
import webUtil from './util';

class Login {

  login(blockchain){
    let binanceArr = ['okchain'];

    switch (true) {
      case (binanceArr.indexOf(blockchain)!==-1) :
        return this.binanceLogin(blockchain);
      default:
        break;
    }
  }

  // 登录
  async binanceLogin(blockchain){
    let account = {};
    let network = config[blockchain].network;
    await webUtil.initMathExtension().then(()=>{
      return mathExtension.getIdentity(network);
    }).then((identity)=>{
      webUtil.setSession("identity_"+blockchain, JSON.stringify(identity));
      account = identity;
    }).catch(err=>{
      console.log(err)
    });
    return account;
  }
}

let login = new Login;

export default login;
