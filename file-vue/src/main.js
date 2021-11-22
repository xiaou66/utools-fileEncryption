import Vue from 'vue'
import App from './App.vue'
import './js/md5'
import './index.css'
import { Button, Row, Col, Radio, Table, Input, message, Progress } from 'ant-design-vue'
Vue.config.productionTip = false
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)
Vue.use(Radio)
Vue.use(Table)
Vue.use(Input)
Vue.use(Progress)
Vue.prototype.$message = message
new Vue({
  render: h => h(App)
}).$mount('#app')
