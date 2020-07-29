<template>
<div class="login-container main-container">
  <img :src="'static/img/chain/'+blockchain_lowercase+'_banner.jpg'" width="100%">
  <div class="info">
    <h1><span>{{$t('webwallet_your')}}</span> {{blockchain}} <span>{{$t('webwallet_wallet')}}</span></h1>
    <p><span>{{$t('webwallet_home_des1')}}</span> {{tokenInfo.name}} <span v-if="tokenInfo.flag">({{token}} & Tokens)</span> <span>{{$t('webwallet_home_des2')}}</span></p>
    <div><a @click="login" class="btn">{{$t('webwallet_login')}}</a></div>
  </div>
</div>
</template>
<script>

export default {
  props: ['blockchain'],
  data() {
    return {
      blockchain_lowercase:'',
      nodeUrl:'',
      network:'',
      token:'',
      tokenInfo:{}
    }
  },
  created() {
    this.getChain();
    this.tokenInfo = this.webUtil.getBlockchainName(this.blockchain_lowercase);
  },
  methods:{
    getChain(){
      if (this.blockchain) {
        let blockchain = this.blockchain.toLowerCase()
        this.blockchain_lowercase = blockchain
        this.nodeUrl = this.globalData[blockchain].nodeUrl
        this.network = this.globalData[blockchain].network
        this.token = this.globalData[blockchain].token
      }
    },
    login(){
      this.webLogin.login(this.blockchain_lowercase).then((res)=>{
        if (!res){
          this.extensionLock();
        }else{
          this.$emit('sendAccount', res);
        }
      }).catch(()=>{
        this.noExtension();
      })
    },
    // 没有安装插件
    noExtension(){
      this.$confirm({
        content:this.$t('noMathExtension'),
        yesText:"Download",
        noText:"Close"
      }).then(success=>{
        if (success){
          window.open(this.globalData.website);
        }
      });
    },
    // 插件被锁定
    extensionLock(){
      this.$alert({
        content: this.$t('mathExtensionLock'),
        btnText: 'Close'
      }).then(()=>{
        window.location.reload();
      });
    }
  },
  watch: {
    $route(to, from) {
      console.log(this.$route.path);
    }
  }
}
</script>
<style scoped>
a.btn{
  width: 45%;
}
  .ledger-login a.btn{
    margin-top: 20px;
  }
</style>

