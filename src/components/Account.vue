<template>
  <div :class="show_all === true ? 'show_all': 'hidden_all'">

    <div class="user_info">
      <img class="user_headimg" :src="picture_url"/>
      <p class="nickname">{{ nickname }}</p>
    </div>

    <div class="account_info">
      <!-- 完整语法 v-bind:style= -->
      <p class="username">登录账号： <span>{{ username }}</span></p>
      <p class="password">登录密码： <span>{{ password }}</span></p>
      <p class="status">账号状态： <span :style="status !== 'working' ? 'color: red': ''">{{statusDict[status]}}</span></p>
      <p class="expired_at">到期时间： <span>{{ expired_at }}</span></p>
    </div>

    <div class="choose_box">
      <!-- 完整语法 v-on:click= -->
      <!--<div @id="month1" @click="select_tariff(month1)" :class="tariff_name === month1 ? 'selected_box': 'unselected_box'">-->
        <!--<p>充值1个月</p>-->
        <!--<p style='font-weight:bold'>50元</p>-->
      <!--</div>-->
      <div @id="month3" @click="select_tariff(month3)" :class="tariff_name === month3 ? 'selected_box': 'unselected_box'">
        <p>充值3个月</p>
        <p style='font-weight:bold'>150元</p>
      </div>
      <div @id="month6" @click="select_tariff(month6)" :class="tariff_name === month6 ? 'selected_box': 'unselected_box'">
        <p>充值6个月</p>
        <p style='font-weight:bold'>300元</p>
      </div>
    </div>

    <div class="pay_button">
      <button @click="start_pay" :class="tariff_name ? 'enabled_button': 'disabled_button'">充值</button>
    </div>

  </div>
</template>

<script>
import Api from '@/api/user2'

export default {
  name: 'Account',
  data () { // 定义属性变量
    return {
      nickname: '',
      picture_url: '', // http://pic.ffpic.com/files/tupian/tupian636.jpg
      username: 'null',
      password: 'null',
      status: 'unknown',
      statusDict: {
        expired: '已过期, 需充值',
        working: '正常使用中',
        inactive: '已停用, 请联系管理员'
      },
      expired_at: '2000年1月1日 00:00:00',
      show_all: false,

      tariff_name: '',
      month1: 'month1',
      month3: 'month3',
      month6: 'month6'
    }
  },
  async mounted () {
    // alert(this.$route.query.code)
    let code = this.$route.query.code
    if (process.env.NODE_ENV === 'development' && code === null) {
      // note 用于测试
      code = 'testcode'
    }

    const api = new Api(this)
    // 异步获取用户资料
    // 异步获取用户信息. (Promise 对象, 必须使用 await)
    let userResponse = await api.getUser({code: code})
    this.username = userResponse.data.account.username
    this.password = userResponse.data.account.radius_password
    this.expired_at = this.$moment(userResponse.data.account.expired_at).format('YYYY年MM月DD日 HH:mm:ss')
    this.status = userResponse.data.account.status
    this.picture_url = userResponse.data.user.picture_url
    this.ssid = userResponse.data.platform.ssid

    // 标记已经初始化
    this.show_all = true
  },
  methods: { // 定义函数方法
    select_tariff (name) {
      this.tariff_name = name
    },
    call_wechat_pay (wepayParams) {
      let vueThis = this
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        wepayParams,
        function (response) {
          // alert(response.err_code+response.err_desc+response.err_msg)
          if (response.err_msg === 'get_brand_wcpay_request:ok') { // 微信团队提示: response.err_msg将在用户支付成功后返回ok, 但不保证它绝对可靠
            // 支付成功
            // TODO 商户后台查询支付结果,再次确认后跳转
            const api = new Api(this)
            setTimeout(async function () {
              // 异步获取用户免费资源. (Promise 对象, 必须使用 await)
              let accountResponse = await api.getAccount()
              vueThis.expired_at = vueThis.$moment(accountResponse.data.expired_at).format('YYYY年MM月DD日 HH:mm:ss')
              vueThis.status = accountResponse.data.status
            }, 2000)
          } else {
            // alert('支付失败')
            // window.location.href = "/oauth2/index.html"
          }
          vueThis.tariff_name = ''
        }
      )
    },
    async start_pay () {
      // 点击支付
      // console.log(process.env)
      if (!this.tariff_name) {
        alert('请先选择充值套餐!')
        return
      }
      const api = new Api(this)
      let response = await api.postCreateOrder({tariff_name: this.tariff_name})
      console.log(response)
      // 订单信息返回
      if (response.data) {
        let wepayParams = response.data.param
        console.log(wepayParams)
        this.call_wechat_pay(wepayParams)
      }
    }
  },
  computed: {
    /* computed 和 methods 区别 : 缓存 */
  },
  components: {
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  /* TODO: 上-右-下-左: top right bottom left */
  /* TODO: .是class, #是id */
  .hidden_all {
    visibility: hidden;
  }
  .user_info {
    .user_headimg {
      width: 3rem;
      height: 3rem;
      margin: 0.3rem 0rem 0.3rem 0.1rem;
      float: left;
      border-radius: 50%;
    }
    .nickname {
      font-size: 1rem;
      margin-left: 0.3rem;
      display: inline-block;
    }
  }

  .account_info {
    clear: both;
    .username {
      margin: 1rem 0rem 0rem 0.5rem;
    }
    .password {
      margin: 1rem 0rem 0rem 0.5rem;
    }
    .status {
      margin: 1rem 8rem 0rem 0.5rem;
    }
    .expired_at {
      display: inline-block;
      margin: 1rem 0rem 0rem 0.5rem;
    }
  }

  .choose_box {
    width: 100%;
    text-align: center;
    font-size: 60%;
    margin: 2rem 0 0 0;
    display: flex;
    font-size: 1.0rem;
    .selected_box {
      width: 30%;
      margin: 0.5rem;
      color: #fdb77e;
      border: 2px solid #fdb77e;
      -webkit-tap-highlight-color:transparent;
    }
    .unselected_box {
      width: 30%;
      margin: 0.5rem;
      color: #abaec2;
      border: 2px solid #cfd9e8;
      -webkit-tap-highlight-color:transparent;
    }
  }

  .pay_button{
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    /*box-shadow: 1px 1px 10px 1px rgba(0,0,0,0.2);*/
    .disabled_button {
      display: block;
      width: 94%;
      outline: none;
      border: none;
      padding: 0.5rem;
      font-size: 1.6rem;
      opacity: 0.8;
      margin:0.6rem auto;
      background-color: #cfd9e8;
      border-radius: 0.2rem;
      -webkit-tap-highlight-color:transparent;
    }
    .enabled_button {
      display: block;
      width: 94%;
      outline: none;
      border: none;
      padding: 0.5rem;
      font-size: 1.6rem;
      opacity: 0.8;
      margin:0.6rem auto;
      background-color: #fdb77e;
      border-radius: 0.2rem;
    }
  }
</style>
