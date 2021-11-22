<template>
  <div class="hello" style="padding-top: 10px">
    <a-row type="flex" justify="center" >
      <a-col :span="2" style="line-height: 32px;">总控制</a-col>
      <a-col :span="12"><a-input v-model="totalValue" @change="totalControl"></a-input></a-col>
      <a-col :span="6" :push="1">
        <div style="display: flex;justify-content: center;">
          <a-button :loading="loading" @click="start">开始</a-button>
          <a-button  @click="openFile" style="margin: 0 10px">增加文件</a-button>
          <a-button  @click="clearFiles">清理</a-button>
        </div>
      </a-col>
    </a-row>
    <div style="font-size: 24px">
      <a-progress :percent="totalProgress" :show-info="false" :stroke-color="{
        '0%': '#108ee9',
        '100%': '#87d068',
      }"/>
    </div>
    <div style="max-height: 80vh; overflow-y: auto">
      <a-table :columns="columns" :dataSource="files" :pagination="false">
      <span slot="code" slot-scope="_, record">
        <a-input v-model="record.code"></a-input>
      </span>
        <span slot="mode" slot-scope="text,record">
         <a-radio-group name="radioGroup" :defaultValue="text" v-model="record.mode">
            <a-radio value="encode">加密</a-radio>
            <a-radio value="decode">解密</a-radio>
          </a-radio-group>
      </span>
        <span slot="action" slot-scope="_, record">
          <div style="display: flex">
            <a-button @click="removeItem(record)" type="link">移除</a-button>
            <a-button style="padding-left: 5px;" @click="openFilePosition(record)" type="link">位置</a-button>
          </div>
        </span>
      </a-table>
    </div>
  </div>
</template>

<script>
import uuidv1 from 'uuid/v1'
import {
  enable as enableDarkMode,
  disable as disableDarkMode
} from 'darkreader'
const columns = [
  {
    title: '文件名',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
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
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    width: 130
  }
]

export default {
  name: 'HelloWorld',
  data () {
    return {
      columns,
      files: [],
      totalValue: '',
      loading: false,
      notification: false
    }
  },
  computed: {
    totalProgress () {
      const rw = this.files.filter(file => file.status !== '未完成')
      if (rw.length === 0) {
        return 0
      }
      const total = rw.reduce((pre, item) => {
        if (item.status === '完成') {
          return pre + 100
        }
        return pre + parseInt(item.status)
      }, 0)
      const value = Math.round((total / (100 * rw.length) * 100))
      // return total
      if (value === 100 && this.notification) {
        this.sendNotification()
      }
      return value
    }
  },
  created () {
    // eslint-disable-next-line no-undef
    utools.onPluginReady(() => {
      this.files = []
    })
    // eslint-disable-next-line no-undef
    utools.onPluginEnter(({ code, type, payload }) => {
      this.notification = false
      if (window.utools.isDarkColors()) {
        enableDarkMode({
          darkSchemeBackgroundColor: '#303133'
        })
      } else {
        disableDarkMode()
      }
      if (code === 'file') {
        this.filePathHandler(payload)
      }
    })
    // eslint-disable-next-line no-undef
    utools.onPluginOut(() => {
      if (this.files.filter(item => item.status !== '未完成' && item.status !== '完成').length) {
        this.notification = true
      }
    })
  },
  methods: {
    openFilePosition ({ path }) {
      // eslint-disable-next-line no-undef
      utools.shellShowItemInFolder(path)
    },
    sendNotification () {
      // eslint-disable-next-line no-undef
      utools.showNotification('文件加密任务已经完成')
      this.notification = false
    },
    clearFiles () {
      const runFiles = this.files.filter(item => item.status !== '未完成' && item.status !== '完成')
      this.files.length = 0
      this.files.push(...runFiles)
      this.$message.success('清空了完成和未完成的加密任务')
    },
    removeItem ({ key }) {
      const index = this.files.findIndex(item => item.key === key)
      if (index !== -1) {
        this.files.splice(index, 1)
      }
    },
    filePathHandler (files) {
      let tips = false
      this.files.push(...files.map((item) => {
        const index = this.files.findIndex(i => i.path === item.path)
        if (index !== -1) {
          tips = true
          return {}
        }
        const file = { key: `t${uuidv1()}`, name: item.name, path: item.path, code: '', status: '未完成' }
        file.mode = item.name.includes('.xu') ? 'decode' : 'encode'
        return file
      }).filter(item => item.key))
      if (tips) {
        this.$message.warning('存在相同任务已经过滤')
      }
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
      if (!this.files.length) {
        this.$message.warning('文件列表为空')
      }
      if (this.files.findIndex(item => item.code === '') !== -1) {
        this.$message.warning('有密码没有输入请检查')
        return
      }
      this.files.filter(item => item.status === '未完成').map((item) => {
        const index = this.files.findIndex(i => i.key === item.key)
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
