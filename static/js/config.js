export default {
  root: process.env.NODE_ENV === 'production' ? '/web' : '',
  website: 'https://mathwallet.org',
  okchain: {
    nodeUrl: 'https://okex.maiziqianbao.net/okchain/v1',
    token: 'TOKT',
    network: {
      blockchain: 'okchain',
      chainId: 'okchain'
    }
  },
  domain: 'http://localhost:8080',
  browsers: {
    mobile: !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
    android: navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1 //android终端
  }
}
