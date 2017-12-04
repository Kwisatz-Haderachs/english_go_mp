var filePath;
// const AV = require('../../utils/av-weapp-min.js');
// const Form = require('../../model/form.js');
var app = getApp()

Page({
  data: {
    assignment: null,
    content: null,
    voice: null,
    lesson: null,
    userInfo: {}
  },

  startRecording: function () {
    wx.startRecord({
      success: function (res) {
        var tempFilePath = res.tempFilePath
        wx.playVoice({
          filePath: tempFilePath
        })

        setTimeout(function () {
          wx.pauseVoice()
        }, 200000)
      }
    })
  },
  stopRecording: function () {
      wx.stopRecord()
  },
  playRecording: function () {
    wx.playVoice({
      filePath: filePath,
      complete: function () {
      }
    })
  },

  onLoad: function (options) {
    var that = this
    var id = options.assignment
    var lessonId = options.lesson
    var endpoint = 'http://localhost:3000/api/v1/assignments/1'// `https://english-go.herokuapp.com/api/v1/assignments/${id}`
    wx.request({
      url: endpoint,
      header: { 'content-type': 'application/json' },
      success: function (res) {
        // res contains all the HTTP request data
        console.log('success!' + res.statusCode);
        console.log(res.data);
        // Update local data storage
        let assignment = res.data
        that.setData({
           content: assignment.content,
           voice: assignment.voice
        })
      },
      fail: function (res) {
        console.log(res.data);
        console.log('failed!' + res.statusCode);
      },
      complete: function (res) {
        console.log(res.data);
        console.log('completed!' + res.statusCode);
      }
    })
  },
  //上传录音
  uploadVoice: function(){
    var that = this
    wx.uploadVoice({
        localId: voice.localId, // 需要上传的音频的本地ID，由stopRecord接口获得
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: function (res) {
            //把录音在微信服务器上的id（res.serverId）发送到自己的服务器供下载
            filePath = res.tempFilePaths[0];
            qiniuUploader.upload(filePath, (res) => {
              that.setData({
                voice : res.voice,
              });
            })
          }
        }
    );
    //注册微信播放录音结束事件【一定要放在wx.ready函数内】
    wx.onVoicePlayEnd({
      success: function (res) {
          stopWave();
      }
    })
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  bindSubmission: function(event){

    this.setData({
      loading: !this.data.loading
    })

    wx.request({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/submissions', // 'https://english-go.herokuapp.com/api/v1/submissions',
      data: {
        lesson: {
          student_id: 2, //their open_id
          assignment_id: 1, //passed in when access form
          teacher_id: 1, // all teacher 1 for now
          voice: "F me",
          content: "Seriously!"
        }
      },
      success: function (response){
        let res = response.data;
        console.log(res)
      },
      fail: function (res) {
        console.log(res.data);
        console.log('failed!' + res.statusCode);
      }
    })


    wx.showToast({
      title: 'Sending :P',
      icon: 'loading',
      duration: 1500
    })

    wx.reLaunch({
      url: '/pages/index/index?form=1'
    })
  }
})

