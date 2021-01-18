<template>
  <div :class="{webwallet:account}">
    <web-nav :blockchain="blockchain"></web-nav>
    <login v-if="!account" @sendAccount="getAccount" :blockchain="blockchain"></login>
    <template v-else>
      <side-bar :balances="balances" :account="account" :blockchain="blockchain"></side-bar>
      <section class="main-info">
        <div class="main-container transfer-container">
          <div class="tabs">
            <!-- 转账tab -->
            <a class="tab">{{$t("transfer")}}</a>
          </div>
          <!-- 转账内容 -->
          <div class="transfer">
            <form class="basic-form">
              <!-- 接收地址 -->
              <label>{{$t("webwallet_to_address")}}</label>
              <input type="text" :placeholder="$t('webwallet_to_address_pl')" v-model="transfer.account">
              <ul class="basic-group clearfix">
                <li class='amount'>
                  <!-- 转账金额 -->
                  <label>{{$t("transfer_amount")}}</label>
                  <input type="text" placeholder="0" v-model="transfer.amount">
                </li>
                <li class="token">
                  <!-- Token -->
                  <label>Token</label>
                  <select v-model="transfer.token">
                    <option v-for="item in values" :value="item" :key="item">{{item}}</option>
                  </select>
                </li>
              </ul>
              <div class="fee-set">
                <!-- 手续费 -->
                <label>{{$t("webwallet_fee")}}</label>
                <!--<label v-show="selectedSet==2" class="setBtn" @click="setToggle(1)">{{$t("webwallet_simple")}}</label>-->
                <!--<label v-show="selectedSet==1" class="setBtn" @click="setToggle(2)">{{$t("webwallet_advanced")}}</label>-->
                <!-- 普通设置 -->
                <ul v-show="selectedSet==1" class="basic-group clearfix">
                  <li class="amount slider" ref="slider">
                    <div class="thunk" :style="{left}" ref="thunk">
                      <div class="block"><img src="static/img/icons/slider@2x.png" width="16"></div>
                    </div>
                    <div class="cheap">{{$t("webwallet_cheap")}}</div>
                    <div class="fast">{{$t("webwallet_fast")}}</div>
                  </li>
                  <li class="token">
                    <div class="input">{{transfer.fee.toFixed(6)}} {{transfer.token}}</div>
                  </li>
                </ul>
              </div>
              <!-- 备注 -->
              <label>{{$t("memo")}}</label>
              <input type="text" :placeholder="$t('webwallet_memo_pl')" v-model="transfer.memo">
              <a class="btn" v-if="!transferring" @click="sendTransfer">{{$t("transfer")}}</a>
              <button class="btn" v-else disabled="disabled">{{$t('transferring')}}</button>
            </form>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
<script>
  import webNav from 'base/nav'
  import login from 'base/login'
  import sideBar from 'base/sidebar'
  import common from 'static/js/common.js'
  import BigNumber from 'static/js/bignumber.mjs'

  export default {
    data() {
      return {
        blockchain: 'OKChain',
        account: '',
        config:this.globalData.okchain,
        unit: this.webCoin.unit,
        selectedSet: 1,
        slider: null, //滚动条DOM元素
        thunk: null, //拖拽DOM元素
        progress:{
          per: 1, //当前值
          min: 1,
          max: 20
        },
        transfer: {
          'account': '',
          'amount': 0,
          'token': 'OKT',
          'memo': '',
          'fee': 0.1, 
          'gasPrice': '0.0000005',
          'gasLimit': 200000
        },
        utoken: 'okt',
        account_number: 0,
        sequence: 0,
        decimal: 18,
        values: [],
        coin: {
          'cny': 1,
          'usd': 7,
          'krw': 0.0058
        },
        tokenPrice: {
          'rmb': 0,
        },
        balances: {
          sum: 0,
          USD: 0,
          CNY: 0,
          KRW: 0,
          list: {

          }
        },
        transferring: false,
      }
    },
    created() {
      this.getAccount();
    },
    mounted() {
      this.getUnit();
    },
    updated() {
      this.progressSlide();
    },
    computed: {
      // 设置一个百分比，提供计算slider进度宽度和trunk的left值
      // 对应公式为  当前值-最小值/最大值-最小值 = slider进度width / slider总width
      // trunk left =  slider进度width + trunk宽度/2
      scale() {
        return (this.progress.per - this.progress.min) / (this.progress.max - this.progress.min);
      },
      width() {
        if (this.slider) {
          return this.slider.offsetWidth * this.scale + 'px';
        } else {
          return 0 + 'px'
        }
      },
      left() {
        if (this.slider) {
          var left = this.slider.offsetWidth * this.scale - this.thunk.offsetWidth / 2

          if (left <= 0) {
            left = 0
          } else if (left >= this.slider.offsetWidth - this.thunk.offsetWidth) {
            left = this.slider.offsetWidth - this.thunk.offsetWidth
          }
          return left + 'px';
        } else {
          return '0px'
        }
      },
      feeCompute() {
        let price = new BigNumber(this.transfer.gasPrice +'');
        return price.times(this.transfer.gasLimit).div(Math.pow(10, this.decimal));
      }
    },
    methods: {
      getAccount() {
        if (this.webUtil.getSession('identity_okchain')) {
          let tmp = JSON.parse(this.webUtil.getSession('identity_okchain'));
          this.account = JSON.parse(tmp).account;
          this.initExtension();
        }
      },
      getUnit() {
        // 用$on事件来接收参数
        common.$on('val', (data) => {
          this.unit = data
        })
      },
      setToggle(val) {
        this.selectedSet = val;
      },
      progressSlide() {
        this.slider = this.$refs.slider;
        this.thunk = this.$refs.thunk;
        let _this = this;
        this.transfer.fee = 1 * (this.progress.per / this.progress.max).toFixed(18)
        console.log(this.transfer.fee);
        this.thunk.onmousedown = function (e) {
          let width = parseInt(_this.width);
          let disX = e.clientX;
          document.onmousemove = function (e) {
            // value, left, width
            // 当value变化的时候，会通过计算属性修改left，width

            // 拖拽的时候获取的新width
            let newWidth = e.clientX - disX + width;
            // 拖拽的时候得到新的百分比
            let scale = newWidth / _this.slider.offsetWidth;
            let max = _this.progress.max;
            let min = _this.progress.min;

            _this.progress.per = Math.ceil((max - min) * scale + min);
            _this.progress.per = Math.max(_this.progress.per, min);
            _this.progress.per = Math.min(_this.progress.per, max);
            _this.transfer.fee = 1 * (_this.progress.per / max).toFixed(18)

          console.log(_this.transfer.fee);
          }
          document.onmouseup = function (e) {
            document.onmousemove = document.onmouseup = null;
          }
          return false;
        }
      },
      getBalance(){
        return new Promise(resolve => {
          this.$http.get(this.config.nodeUrl + '/auth/accounts/' + this.account).then((res1)=>{
            if (res1.body.value) {
              let res = res1.body.value;
              resolve(res);
            }
          });
        })
      },
      initExtension() {
        new Promise(() => {
          // 获取可用
          this.getBalance().then((res) => {
            let coins = res.coins;
            coins.forEach((coin) => {
              let token = coin.denom.toUpperCase();
              this.values.push(token);
              this.balances.list[token] = coin.amount;
            });
          }).then(() => {
            this.balances.sum = this.balances.list[this.config.token];
            this.balances.CNY = new BigNumber(this.balances.sum).times(this.tokenPrice.rmb).toFixed();
            this.balances.USD = new BigNumber(this.balances.CNY).div(this.coin.usd).toFixed();
            this.balances.KRW = new BigNumber(this.balances.CNY).div(this.coin.krw).toFixed();
          });
        });
      },
      sendTransfer() {
        let address = this.webUtil.trimString(this.transfer.account);
        if (!this.transfer.account) {
          this.$alert(this.$t('transfer_account_null'))
          return false;
        }
        if (!this.transfer.amount) {
          this.$alert(this.$t('transfer_amount_null'))
          return false;
        }
        if (this.transfer.amount < Math.pow(10, -this.decimal)) {
          this.$alert(this.$t('transfer_amount_min') + Math.pow(10, -this.decimal))
          return false;
        }

        this.transferring = true;
        // 普通设置
        let fee = new BigNumber(this.transfer.fee).toFixed(18);
        let limit = this.transfer.gasLimit.toString();

        this.getBalance().then((res)=>{
          this.account_number = res.account_number;
          this.sequence = res.sequence;
        }).then(()=>{
          this.webUtil.initMathExtension().then(() => {
            return mathExtension.getIdentity(this.config.network);
          }).then(() => {
            let transaction = {
              account_number: this.account_number.toString(),
              chain_id: this.config.network.chainId,
              fee: {
                amount: [{
                  denom: this.transfer.token.toLowerCase(),
                  amount: fee
                }],
                gas: limit,
              },
              memo: this.transfer.memo,
              msgs:
                [
                  {
                    type: "okexchain/token/MsgTransfer",
                    value: {
                      amount:[{
                        amount: new BigNumber(this.transfer.amount).toFixed(18),
                        denom: this.transfer.token.toLowerCase()
                      }],
                      from_address: this.account,
                      to_address: address
                    }
                  }
                ],
              sequence: this.sequence.toString()
            };
            console.log("->",JSON.stringify(transaction));
            mathExtension.requestSignature(transaction, this.config.network).then(signedTransaction => {
              let trx = {
                tx:{
                  msg:transaction.msgs,
                  memo:transaction.memo,
                  fee:transaction.fee,
                  signatures:[{
                    ...signedTransaction
                  }]
                },
                mode:"sync"
              };
              this.broadcastTx(trx);
            }).catch(e => {
              console.log(e.message);
              this.$alert(this.$t('transfer_fail'))
              this.transferring = false;
            })
          })
        })
      },
      successFallback(){
        this.transferring = false;
        this.transfer.account = '';
        this.transfer.amount = 0;
        this.transfer.memo = '';
        this.balances.sum = 0;
        this.balances.CNY = 0;
        this.balances.KRW = 0;
        this.balances.USD = 0;
        this.balances.list = {};
        this.progress.per = 2;
        this.values = [];
        this.initExtension();
      },
      broadcastTx(trx){
        this.axios.post(this.config.nodeUrl + '/txs?sync=true', JSON.stringify(trx), {
          contentType: "text/plain"
        }).then((res)=>{
          console.log(res);
          if (res.data.code) {
            this.$alert(log.message);
            this.transferring = false;
          } else if (res.data.txhash) {
            this.$alert(this.$t('transfer_success')).then(()=>{
              this.successFallback();
            });
          }
        }).catch(err=>{
          this.$alert(this.$t('transfer_fail'));
          this.transferring = false;
          console.log(err);
        })
      }
    },
    components: {
      sideBar,
      login,
      webNav
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>

</style>
