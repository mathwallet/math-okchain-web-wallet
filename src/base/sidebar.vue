<template>
  <div>
    <section class="user-info text-center">
      <div class="avator">
        <img :src="'static/img/chain/'+blockchain_lowercase+'_icon@2x.png'" width="100%" />
      </div>
      <h4>{{blockchain}} Wallet</h4>
      <p id="copyContent">{{account}}</p>
      <div class="operation-list" v-bind:class="{shard_select:shard_selected}">
        <!-- 复制地址 -->
        <a class="grey-fsz" @click="copyAddress(account)">{{$t("webwallet_copy_address")}}</a>
      </div>

      <div class="token-info">
        <!-- 估值 -->
        <p>{{$t("webwallet_estimated_value")}}</p>
        <h4>{{webUtil.addCommas(balances.sum,4)}} {{token}}</h4>
        <p class="grey-fsz">≈ {{balances[unit] ? webUtil.addCommas(balances[unit]) : 0}} {{unit}}</p>
        <ul class="token-list">
          <li v-for="(item,index) in balances.list" :key="index">
            <div>{{index}}</div>
            <div>{{item?webUtil.addCommas(item,4):0}}</div>
          </li>
        </ul>
      </div>
    </section>
    <div class="refresh-logout">
      <!-- 刷新 -->
      <a class="grey-fsz refresh" @click="refresh">{{$t('webwallet_refresh')}}</a>
      <!-- 退出 -->
      <a class="grey-fsz logout" @click="logout">{{$t('webwallet_logout')}}</a>
    </div>
  </div>
</template>
<style scoped>
.shard label {
  margin-right: 8px;
}
.shard select {
  padding: 0 8px 0 22px;
  width: 60px;
  border-radius: 0;
  background: url("../../static/img/icons/dropdown_black@2x.png") no-repeat 44px
    center/12px;
}

</style>
<script>
import common from "static/js/common.js";
export default {
  props: ["account", "balances", "blockchain"],
  data() {
    return {
      unit: this.webCoin.unit,
      blockchain_lowercase: "",
      network: "",
      token: "",
      shard_selected: false,
      time: "",
      value: {
        CNY: 0,
        USD: 0,
        KRW: 0
      },
      binanceArr: ["binance", "cosmos", "irisnet", "enigma", "kava", "secret", 'band', 'okchain'],
      cosmosArr: ['cosmos', 'irisnet', 'kava', 'band', 'secret'],
    };
  },
  created() {
    this.getChain();
  },
  mounted() {
    this.getUnit();
  },
  methods: {
    refresh() {
      window.location.reload();
    },
    getChain() {
      if (this.blockchain) {
        let blockchain = this.blockchain.toLowerCase();
        this.blockchain_lowercase = blockchain;
        this.network = this.globalData[blockchain].network;
        this.token = this.globalData[blockchain].token;
      }
    },
    logout() {
      this.webUtil.initMathExtension().then(() => {
        mathExtension
          .forgetIdentity(this.network)
          .then(() => {
            this.webUtil.delSession("identity_" + this.blockchain_lowercase);
            window.location.reload();
          })
          .catch(() => {
            this.webUtil.delSession("identity_" + this.blockchain_lowercase);
          });
      }).catch(()=>{
        this.$alert({
          content: this.$t('mathExtensionLock'),
          btnText: 'Close'
        })
      })
    },
    // 复制
    copyAddress(val) {
      if (this.globalData.browsers.android) {
        var oInput = document.createElement("input");
        oInput.type = "text";
        oInput.value = val;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象
        document.execCommand("Copy"); // 执行浏览器复制命令
        oInput.parentNode.removeChild(oInput); //执行完之后删除该对象
        this.$toast(this.$t("copy_success"));
      } else {
        this.$copyText(val).then(
          e => {
            //复制成功的回调
            this.$toast(this.$t("copy_success"));
          },
          e => {
            this.$toast(this.$t("copy_fail"));
          }
        );
      }
    },
    getUnit() {
      // 用$on事件来接收参数
      common.$on("val", data => {
        this.unit = data;
      });
    }
  }
};
</script>
