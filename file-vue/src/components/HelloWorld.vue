<template>
  <div class="hello" style="padding-top: 10px">
    <a-row type="flex" justify="center" >
      <a-col :span="2" style="line-height: 32px;">总控制</a-col>
      <a-col :span="12"><a-input v-model="totalValue" @change="totalControl"></a-input></a-col>
      <a-col :span="2" :push="1"><a-button :loading="loading" @click="start">开始</a-button></a-col>
      <a-col :span="1" :push="1" style="margin-left: 5px;"><a-button  @click="openFile">增加文件</a-button></a-col>
    </a-row>
    <div style="max-height: 80vh; overflow-y: auto">
      <a-table :columns="columns" :dataSource="files" :pagination="false" style="padding-top: 10px;">
      <span slot="code" slot-scope="_, record">
        <a-input v-model="record.code"></a-input>
      </span>
        <span slot="mode" slot-scope="text,record">
         <a-radio-group name="radioGroup" :defaultValue="text" v-model="record.mode">
            <a-radio value="encode">加密</a-radio>
            <a-radio value="decode">解密</a-radio>
          </a-radio-group>
      </span>
      </a-table>
    </div>
    <div style="position:absolute;user-select: none; bottom: 0; line-height: 60px; left: 50%; transform: translateX(-50%);cursor: pointer;" @click="help">请开发者喝咖啡</div>
  </div>
</template>

<script>
import uToolsUtils from '../js/uToolsUtils'

const columns = [
  {
    title: '文件名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '密码',
    dataIndex: 'code',
    key: 'code',
    scopedSlots: { customRender: 'code' }
  },
  {
    title: '模式',
    dataIndex: 'mode',
    key: 'mode',
    scopedSlots: { customRender: 'mode' }
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  }
]

export default {
  name: 'HelloWorld',
  data () {
    return {
      columns,
      files: [],
      totalValue: '',
      loading: false

    }
  },
  created () {
    // eslint-disable-next-line no-undef
    utools.onPluginReady(() => {
      uToolsUtils.isNewVersion()
    })
    // eslint-disable-next-line no-undef
    utools.onPluginEnter(({ code, type, payload }) => {
      console.log('11111111111111')
      this.files = []
      if (code === 'file') {
        this.filePathHandler(payload)
      }
    })
  },
  methods: {
    filePathHandler (files) {
      this.files.push(...files.map((item) => {
        const file = { key: `t${Date.now()}`, name: item.name, path: item.path, code: '', status: '未完成' }
        file.mode = item.name.includes('.xu') ? 'decode' : 'encode'
        return file
      }))
    },
    openFile () {
      const files = window.openFile()
      if (!files) {
        this.$message.warning('未选择文件')
        return
      }
      this.filePathHandler(files)
    },
    start () {
      if (this.files.findIndex(item => item.code === '') !== -1) {
        this.$message.warning('有密码没有输入请检查')
        return
      }
      this.files.map((item, index) => {
        if (item.mode === 'encode') {
          const key = item.code.MD5(16)
          window.xencode('aes-128-cbc', item.path, key, item.code.MD5(), (progress) => {
            this.files[index].status = progress
          }).then(res => {
            this.files[index].status = res
          })
        } else {
          const key = item.code.MD5(16)
          window.xdecode('aes-128-cbc', item.path, key, item.code.MD5(), (progress) => {
            this.files[index].status = progress
          }).then(res => {
            this.files[index].status = res
          })
        }
      })
    },
    help () {
      window.openUrl('https://yuanliao.info/d/1364/21')
    },
    totalControl () {
      this.files.map(item => {
        item.code = this.totalValue
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
