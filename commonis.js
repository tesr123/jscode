
(function fn() {
  console.log(2222)
  window.isconnon = {
    mobileCheckStatusNameCodeList: [
      {
        label: '全部',
        value: ''
      },
      {
        label: '空号',
        value: '0'
      },
      {
        label: '实号',
        value: '1'
      },
      {
        label: '停机(预留)',
        value: '2'
      },
      {
        label: '库无',
        value: '3'
      },
      {
        label: '沉默号',
        value: '4'
      },
      {
        label: '风险号',
        value: '5'
      }
    ],
    createRequest(tasks, limit, _this) {
      limit = limit || 10
      const results = []
      let index = 0
      let poolTasks = new Array(limit).fill(null) // 发送请求的任务数组
      poolTasks = poolTasks.map((item, i) => {
        // limit个promise.
        // 每个promise做的操作就是等待上一次task执行，进行下一个task，即是递归
        return new Promise((resolve, reject) => {
          console.log('current i:', i) // 同步任务
          const run = function () {
            if (index >= tasks.length) {
              console.log(111)
              resolve() // promise状态为成功
              return
            }
            const old_index = index
            const task = tasks[index++]
            // 进入异步队列
            task().then(res => {
              console.log('2')
              console.log(res)
              if (res.code === '200') {
                results[old_index] = res
                run()
              } else {
                reject(res)
              }
            }).catch(e => {
              console.log('3')
              reject(e)
            })
          }
          console.log(1111111)
          run()
        })
      })
      // 只有poolTasks(promise数组)的所有promise状态为resolve才执行then
      return Promise.all(poolTasks).then(() => results)
    },
    GetConveyPDF(_this) {
      _this.case_status = response.data.caseCode
      // response.data.files.length = 3
      _this.pdf_tabs_list = response.data.files
      for (const i in _this.pdf_tabs_list) {
        _this.pdf_tabs_list[i].name = i
      }
      // 循环加载PDF每次只加载三个避免渲染太卡
      for (const pdf_tabs_list_index in _this.pdf_tabs_list) {
        if (pdf_tabs_list_index <= _this.list_count) {
          _this.pdf_data_list.push(_this.pdf_tabs_list[pdf_tabs_list_index])
        }
      }
    },
    page_created(_this) {
      // 获取当前的案件
      _this.caseInfoId = _this.$route.query.caseInfoId
      // 没有对多级做出判断，只对一级进行了判断
      _this.parPath = _this.$route.path.substring(_this.$route.path.indexOf('/'), _this.$route.path.lastIndexOf('/'))
      // 获取分页
      _this.table_screen_tepairdata = _this.$store.state.user.table_screen_tepairdata
      // 获取当前的筛选信息
      _this.config_url = _this.$store.state.user.table_screen_tepairdata.config_url[_this.parPath]
      // 获取当前分页信息,并且进行深拷贝
      _this.page_screen = _this.$common.Copy(_this.table_screen_tepairdata.sereen[_this.parPath])
      if (_this.$store.state.user.table_screen_tepairdata[_this.parPath]) {
        _this.screen_data = _this.$common.Copy(_this.$store.state.user.table_screen_tepairdata[_this.parPath])
      }
      _this.init_page = _this.$common.Copy(_this.table_screen_tepairdata.sereen[_this.parPath].page)
      _this.staGetList()
    },
    formcreated(_this) {
      _this.tilt_text = _this.$common.isEmpty(_this.FormConfig.tilt_text) ? false : _this.FormConfig.tilt_text
      // 请在父级进行深拷贝，避免影响列表展示
      _this.axiosdata = _this.FormConfig.axiosdata
      // 判断是否有纯文字回显
      if (_this.FormConfig.textdata) {
        _this.textdata = _this.FormConfig.textdata
      }
      _this.transform = _this.FormConfig.config.transform
      if (_this.axiosdata.password) {
        _this.password = _this.axiosdata.password
      }
      const list_data = _this.FormConfig.data
      const ruleValidate_data = {}
      for (const list_data_v of list_data) {
        for (const group_v of list_data_v.group) {
          // 将所有必选项加入选择
          if (group_v.radio) {
            ruleValidate_data[group_v.key] = group_v.verify ? group_v.verify : [{ required: true, message: `请填写${group_v.name}`, trigger: 'blur' }]
          }
          if (group_v.type === 'Money' || group_v.type === 'phone') {
            // 金额如果没有默认的格式验证则添加默认验证
            // 将父级传过来的值进行判断把不能为空这些加入进去
            ruleValidate_data[group_v.key] = _this.$common_form.changeRule(group_v)
          }
        }
      }
      _this.ruleValidate = Object.assign(ruleValidate_data, _this.FormConfig.ruleValidate)
      console.log(_this.ruleValidate, 'ruleValidate')
      if (_this.FormConfig.style) {
        _this.is_win = !_this.$common.isEmpty(_this.FormConfig.style.label_width)
        _this.is_position = !_this.$common.isEmpty(_this.FormConfig.style.label_position)
        _this.btn_box_style = !_this.$common.isEmpty(_this.FormConfig.style.btn_style) ? _this.FormConfig.style.btn_style : {}
      }
      if (_this.FormConfig.btnconfig) {
        _this.is_btn_list = !_this.$common.isEmpty(_this.FormConfig.btnconfig.btn_list)
      }
      _this.loading = false
    },
    formaxiosform(_this, data) {
      Object.assign(data, _this.FormConfig.repairdata)
      if (_this.FormConfig.config.Form) {
        const formData = new FormData() // 创建form对象
        Object.keys(data).map(key => {
          formData.append(key, data[key])
        })
        data = formData
      }
      // 判断是否是编辑
      _this.is_loading = true
    },
    createFileChunk(file, size = SIZE) {
      const fileChunkList = []
      let cur = 0
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) })
        cur += size
      }
      return fileChunkList
    },
    initCanvas(_this) {
      let beginX = ''
      let beginY = ''
      const canvas = _this.canvas_dom = document.getElementById('canvas')
      const ctx = canvas.getContext('2d')
      const winW = window.innerWidth
      const winH = window.innerHeight
      console.log(winW, winH)
      canvas.width = winW - 20
      canvas.height = 200
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      canvas.addEventListener('touchstart', function (event) {
        event.preventDefault() // 阻止在canvas画布上签名的时候页面跟着滚动
        beginX = event.touches[0].clientX - _this.offsetLeft
        beginY = event.touches[0].pageY - _this.offsetTop
      })
      canvas.addEventListener('touchmove', (event) => {
        event.preventDefault() // 阻止在canvas画布上签名的时候页面跟着滚动
        event = event.touches[0]
        const stopX = event.clientX - canvas.offsetLeft
        const stopY = event.pageY - canvas.offsetTop
        _this.writing(beginX, beginY, stopX, stopY, ctx)
        beginX = stopX // 这一步很关键，需要不断更新起点，否则画出来的是射线簇
        beginY = stopY
      })
    },
    LoopRenderingPDF(_this) {
      if (_this.list_count < `${_this.pdf_tabs_list.length}` - 1) {
        _this.list_count++
        _this.pdf_data_list.push(_this.pdf_tabs_list[_this.list_count])
      }
    },
    platablefuncre(_this) {
      const repair_data = _this.$common.Copy(_this.config.repairdata)
      for (const repair_data_v in repair_data) {
        if (_this.$common.isEmpty(repair_data[repair_data_v])) {
          _this.$delete(repair_data, repair_data_v)
        }
      }
      _this.repair_data = repair_data

      if (_this.row_tablt_config) {
        for (const value of _this.row_tablt_config) {
          _this.tabMapOptions.push({ label: value.name, key: value.fun })
        }
        _this.activeName = _this.tabMapOptions[0].key
      }
      // init the default selected tab
      const tab = _this.$route.query.tab
      if (tab) {
        _this.activeName = tab
      }
      _this.selection_fun_is = !_this.$common.isEmpty(_this.config.selection_fun)
        ? this.config.selection_fun
        : false
      _this.rowHeader = _this.config.columns
      _this.getList()
    },
    tablefuncre(response, _this) {
      console.log(response)
      const options = {
        isAutoLogin: true // 隐藏登录界面
      }
      const dom = document.getElementById('NEW_PHONE_BAR')
      var clinkToolbar = new ClinkToolbar(options, dom, () => {
        _this.phone_is = true
        console.log('电话条初始化完成')
      })
      ClinkAgent.setup({ sipPhone: false, debug: false }, function () {
        console.log('电话进入')

        clinkToolbar.userCustomEvent.on(ClinkAgent.EventType.STATUS, e => {
          console.log('坐席状态变化', e, '566666666666666666666666666666666666666666666666666666')
          // 呼入电话响铃
          if (e.code === 'RINGING' && e.action === 'ringingIb') {
            console.log('呼入电话响铃', '11111111111111111111111111111111111111111111111111111')
            /**
             * 需要去获取电话的归属，然后跳转详情页面
             * 如果没有则不跳转并进行提示
             */
            _this.getWorkingOnTheCase(e)
          }
          // 接听电话接起需要去跳详情页面
          if (e.code === 'BUSY' && e.action === 'busyIb') {
            console.log('呼入通话')
            console.log(_this.pathSeeType, '666666666666666666666666666')
            if (_this.pathSeeType === '1') {
              _this.pathSee()
            }
          }
          if (e.code === 'IDLE' && e.action === 'ringingCustomerNoAnswerOb') {
            if (_this.automatic_type) {
              console.log('_this.forCallHandle')
              _this.forCallHandle()
              // _this.updateCallNum()
            }
          }
          if ((e.code === 'RINGING' && e.action === 'ringingIb') || (e.code === 'RINGING' && e.action === 'ringingTransfer')) {
            _this.call_tel = e.customerNumber
            _this.$refs.phome_ring.open(
              (e) => {
                ClinkAgent.sipLink()
                _this.unlinkIs = true
                e()
              }, {}, () => {
                ClinkAgent.sipUnlink()
              }
            )
          }
          if (e.code === 'IDLE' && e.action === 'hangup') {
            _this.unlinkIs = false
          }
          if (e.agentStatus === '空闲' || e.agentStatus === '整理') {
            _this.$refs.phome_ring.cancel()
            _this.unlinkIs = false
          }
          if (e.code === 'WRAPUP' && e.action === 'ACW') {
            _this.unlinkIs = false
          }
          // if (e.code === 'IDLE' && e.action === 'idle') {
          //   _this.unlinkIs = true
          // }
          _this.agentStatus = e.agentStatus
          _this.$refs.timer.reset()
        })
        // 软电话接听
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.SIP_LINK, function (event) {
          console.log(event, '软电话接听')
        })

        // 注册登录响应回调方法
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.LOGIN, function (result) {
          if (result.code === 0) {
            // 登录成功

          } else {
            // 登录失败
          }
        })
        // 注册退出响应回调方法
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.LOGIN, function (result) {
          if (result.code === 0) {
            // 退出成功
            console.log('退出成功')
          } else {
            // 退出失败
          }
        })
        // 置忙
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.PAUSE, function (event) {
          if (event.code === 0) {
            // 成功
            _this.pauseType = 1
            _this.$refs.timer.reset()
          } else {
            // 失败
          }
        })
        // 置闲
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.UNPAUSE, function (event) {
          if (event.code === 0) {
            // 成功
            console.log(1111, '直线')
            _this.pauseType = 0
            _this.unlinkIs = false

            _this.$refs.timer.reset()
          } else {
            // 失败
          }
        })
        ClinkAgent.registerListener(ClinkAgent.EventType.PREVIEW_OUTCALL, function (token) {
          console.log(token)
          _this.unlinkIs = true
          _this.$refs.timer.reset()
          console.log('拨打电话111111111111111111111111111111111111111111111111111111111111')
        }) // 预览外呼

        ClinkAgent.registerListener(ClinkAgent.EventType.PREVIEW_OUTCALL_START, function (event) {
          if (event.code === 0) {
            console.log('拨打电话111111111111111111111111111111111111111111111111111111111111')
          } else {
            // 退出失败
          }
        })
        // 预览外呼
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.PREVIEW_OUTCALL, function (event) {
          if (event.code === 0) {
            _this.$refs.timer.reset()
            // _this.unlinkIs = true
            console.log('拨打电话111111111111111111111111111111111111111111111111111111111111')
          } else {
            // 退出失败
          }
        }) // 预览外呼
        // 外呼取消
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.PREVIEW_OUTCALL_CANCEL, function (event) { })
        // 拒接
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.REFUSE, function (event) { })
        // 挂断
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.UNLINK, function (event) {
          if (event.code === 0) {
            console.log('挂断成功222222222222222222222222222222222222222222')
            // 挂断成功
            _this.unlinkIs = false
          } else {
            // 挂断失败
          }
        })
        clinkToolbar.userCustomEvent.on(ClinkAgent.EventType.UNCONSULT, e => {
          _this.unlinkIs = false
        })
        // 保持
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.HOLD, function (event) { })
        // 保持接回
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.UNHOLD, function (event) { })
        // 静音
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.MUTE, function (event) { })
        // 取消静音
        ClinkAgent.registerCallback(ClinkAgent.ResponseType.UNMUTE, function (event) { })
      })
      _this.phome_data = response
      var params = {}
      params.identifier = response.empCode
      params.bindTel = response.cno
      params.agentToken = response.token
      params.loginStatus = 1
      params.agentTokenLogin = 1

      params.bindType = 3
      ClinkAgent.login(params)
      clinkToolbar.userCustomEvent.on(ClinkAgent.ResponseType.LOGIN, function (event) {
        console.log('座席状态事件回调:', event)

        // const timer = setTimeout(() => {
        //   console.log(_this.$refs, '2222222222222222222222222222222222222 ')

        //   clearTimeout(timer)
        // })
      }),
        clinkToolbar.userCustomEvent.on(ClinkAgent.EventType.PREVIEW_OUTCALL_BRIDGE, e => {
          console.log('预览外呼客户接听事件回调:', e)
          if (_this.automatic_type) {
            console.log('_this.transfer')
            const params = {
              objectType: 3

            }
            params.transferObject = JSON.stringify({
              ivrId: 34103,
              // ivrId:this.$store.state.user.transfer_data.id,
              ivrNode: _this.$store.state.user.transfer_data.endpoint
            })
            // params.transferObject='1005'
            console.log(params, 'paramsparamsparamsparamsparamsparamsparams')
            ClinkAgent.transfer(params)
          }
          _this.$refs.timer.reset()
        })
    },
    tablefun(_this) {
      const screen_data = _this.$store.state.user.table_screen_tepairdata
      if (screen_data[_this.$route.path]) {
        for (const screen_v in screen_data[this.$route.path]) {
          if (!_this.config.repairdata[screen_v]) {
            _this.$set(_this.config.repairdata, screen_v, screen_data[_this.$route.path][screen_v])
          }
        }
      }
      if (_this.config.fun) {
        if (screen_data.config_url) {
          if (screen_data.config_url[_this.$route.path]) {
            if (screen_data.config_url[_this.$route.path].privatedata) {
              _this.config.privatedata = screen_data.config_url[_this.$route.path].privatedata ? screen_data.config_url[_this.$route.path].privatedata : {}
              // for (const privatedata_v in screen_data.config_url[this.$route.path].privatedata) {
              //   console.log(privatedata_v, 'privatedata_v')
              //   // this.$set(this.config.privatedata, privatedata_v, screen_data[this.$route.path][screen_v])
              // }
            }
            screen_data.config_url[_this.$route.path].url = _this.config.fun
            screen_data.config_url[_this.$route.path].privatedata = _this.config.privatedata
            screen_data.config_url[_this.$route.path].url_type = _this.config.method ? _this.config.method : 'post'
          } else {
            screen_data.config_url[_this.$route.path] = {
              url: _this.config.fun,
              url_type: _this.config.method ? _this.config.method : 'post',
              privatedata: _this.config.privatedata,
              initialPrivatedata: _this.config.privatedata ? _this.$common.Copy(_this.config.privatedata) : {}
            }
          }
        } else {
          const config_url = {}
          config_url[_this.$route.path] = {
            url: _this.config.fun,
            url_type: _this.config.method ? _this.config.method : 'post',
            privatedata: _this.config.privatedata,
            initialPrivatedata: _this.config.privatedata ? _this.$common.Copy(_this.config.privatedata) : {}
          }
          screen_data.config_url = config_url
        }

        _this.$store.commit('user/SET_TABLE_SCREEN_TEPAIRDATA', screen_data)
      }
      _this.show_summary = !_this.$common.isEmpty(_this.config.show_summary)
        ? _this.config.show_summary
        : false
      _this.new_style = !_this.$common.isEmpty(_this.config.style)
        ? _this.config.style
        : {}
      const repair_data = _this.$common.Copy(_this.config.repairdata)
      for (const repair_data_v in repair_data) {
        if (_this.$common.isEmpty(repair_data[repair_data_v])) {
          _this.$delete(repair_data, repair_data_v)
        }
      }
      _this.repair_data = repair_data

      if (_this.row_tablt_config) {
        for (const value of _this.row_tablt_config) {
          _this.tabMapOptions.push({ label: value.name, key: value.fun })
        }
        _this.activeName = _this.tabMapOptions[0].key
      }
      // init the default selected tab
      const tab = _this.$route.query.tab
      if (tab) {
        _this.activeName = tab
      }
      _this.selection_fun_is = !_this.$common.isEmpty(_this.config.selection_fun)
        ? _this.config.selection_fun
        : false
      _this.rowHeader = _this.config.columns
      _this.getList()
    },
    resetGetList(_this) {
      const table_screen_tepairdata = _this.$store.state.user.table_screen_tepairdata
      const initialPrivatedata = _this.$common.Copy(table_screen_tepairdata.config_url[_this.$route.path].initialPrivatedata)
      for (const initialPrivatedata_v in initialPrivatedata) {
        _this.$set(_this.config.privatedata, initialPrivatedata_v, initialPrivatedata[initialPrivatedata_v])
      }
      for (const repairdata_value in _this.config.repairdata) {
        _this.config.repairdata[repairdata_value] = ''
      }
      const screen_data = _this.$store.state.user.table_screen_tepairdata
      screen_data[_this.$route.path] = _this.config.repairdata
      _this.$store.commit('user/SET_TABLE_SCREEN_TEPAIRDATA', screen_data)
      _this.listQuery.page = 1
      _this.getList()
    },
    getList(_this) {
      if (_this.selection_fun_is) {
        _this.Selection([])
      }
      const repair_data = Object.assign({}, _this.repair_data, _this.config.defaultscreen, _this.config.repairdata)
      if (_this.config.data_list) {
        for (const repairdata_value in repair_data) {
          _this.$set(
            _this.listQuery,
            `${repairdata_value}`,
            repair_data[repairdata_value]
          )
        }
        const is_arr = _this.config.data_list instanceof Array
        _this.tableData = is_arr
          ? _this.config.data_list
          : _this.config.data_list.records
        _this.total = 0
        _this.listLoading = false
      } else {
        // 请求获取数据
        for (const repairdata_value in repair_data) {
          _this.$set(
            _this.listQuery,
            `${repairdata_value}`,
            repair_data[repairdata_value]
          )
        }
        if (!_this.config.flow_type) {
          _this.GetAxiosData()
        }
      }
    },
    GetAxiosData(_this, is_type_axios) {
      const screen_data = _this.$store.state.user.table_screen_tepairdata
      console.log(screen_data)
      if (is_type_axios !== 'flow' && _this.$route.meta.table_sereen_is && screen_data.sereen[_this.$route.path]) {
        _this.listQuery.page = screen_data.sereen[_this.$route.path].page
        _this.listQuery.size = screen_data.sereen[_this.$route.path].size
        _this.$route.meta.table_sereen_is = false
      } else {
        if (screen_data.sereen) {
          screen_data.sereen[_this.$route.path] = {
            'size': _this.listQuery.size,
            'page': _this.listQuery.page
          }
        } else {
          screen_data.sereen = {}
          screen_data.sereen[_this.$route.path] = {
            'size': _this.listQuery.size,
            'page': _this.listQuery.page
          }
        }
        _this.$store.commit('user/SET_TABLE_SCREEN_TEPAIRDATA', screen_data)
      }

      _this.listLoading = true
      // is_type_axios判断请求类型：flow则是瀑布流二次请求需要页码+1
      if (is_type_axios === 'flow') {
        _this.flow_page++
        _this.listQuery.page = _this.flow_page
      }
    },
    // 拼接url
    encodeSearchParams(obj) {
      const params = []
      Object.keys(obj).forEach((key) => {
        let value = obj[key]
        // 如果值为undefined置空
        if (typeof value === 'undefined') {
          value = ''
        }
        // 使用encodeURIComponent进行编码
        if (Array.isArray(obj[key])) { // 类型为数组的时候
          value.forEach(item => {
            params.push([key, encodeURIComponent(item)].join('='))
          })
        }
        if (Object.prototype.toString.call(obj[key]) === '[object Object]') { // 类型为对象的时候
          Object.keys(obj[key]).forEach(item => {
            params.push([key, encodeURIComponent(obj[key][item])].join('='))
          })
        } else {
          params.push([key, encodeURIComponent(value)].join('='))
        }
      })
      return params.join('&')
    },
    // 判断层级跳转
    IsRoute(router_type) {
      const meta = this['$route'].meta // 获取当前路由
      if (meta.router_type === router_type) {
        return true
      } else {
        return false
      }
    },
    // 清洗list将取到的值转换为数组
    LinstData(data, key) {
      const list = []
      for (const list_v of data) {
        list.push(list_v[key])
      }
      return list
    },
    SeeJudge(url) {
      const see_type = url.substring(url.lastIndexOf('.'), url.length)
      const see_type_list = {
        office: '.pptx.docx.excex.xlsx',
        pdf: '.pdf',
        img: '.gif.jpg.jpeg.png.gif.webp.wbm'
      }
      for (const see_type_list_value in see_type_list) {
        if (see_type_list[see_type_list_value].includes(see_type)) {
          return see_type_list_value
        }
      }
      return false
    },

    // 递归路由
    getAJSDofKind(data, list) {
      for (const data_v of data) {
        const path = data_v.path.indexOf('/') === 0 ? data_v.path.substr(1) : data_v.path
        if (path !== '/' && path) {
          const paths = path.indexOf('/') === -1 ? path : path.substr(path.lastIndexOf('/') + 1)
          list[paths] = data_v
        }
        if (data_v.children) {
          this.getAJSDofKind(data_v.children, list)
        }
      }
      return list
    }
  }

  console.log(window)
})()
