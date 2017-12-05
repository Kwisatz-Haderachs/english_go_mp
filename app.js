//app.js

App({
  onLaunch: function () {
    var that = this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
      wx.login({
        withCredentials: true,
        success: function (res) {
          var code = res.code
          wx.getUserInfo({
            success: function (res) {

              that.globalData.userInfo = res.userInfo
              that.sendCodeToBackend(code, res)

              typeof cb == "function" && cb(that.globalData.userInfo)
              console.log(that.globalData.userInfo)
            }
          })
         }
      })
  },
  getUserInfo:function(cb){
    var that = this;
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      });
    }
  },
  sendCodeToBackend: function (code, res) {
    var that = this
    wx.request({
      url: 'http://localhost:3000/api/v1/users',
      method: 'POST',
      data: { code: code, user: { username: res.userInfo.nickName } },
      success: function (res) {
        console.log('done with sendCodeToBackend')
        that.globalData.open_id = res.data.open_id
        that.globalData.username = res.data.username
        that.globalData.authentication_token = res.data.authentication_token
        console.log(that.globalData)

      },
      fail: function (err) {
        console.log('faield')
        console.error(err)
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
