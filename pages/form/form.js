const qiniuUploader = require("../../utils/qiniuUploader.js");

function initQiniu() {
  var options = {
    region: 'ECN',
    uptoken: 'PJP0bjvUkPBLO3PmSgAfuVyEh9aTAlzYmiItmRCm:u5s-CgIKhJmnCACo4a62kbX2zqQ=:eyJzY29wZSI6ImVuZ2xpc2hnbzp0ZXN0aW5nYWdhaW4ucG5nIiwiZGVhZGxpbmUiOjE1MTI1NDMzODAsInVwaG9zdHMiOlsiaHR0cDovL3VwLnFpbml1LmNvbSIsImh0dHA6Ly91cGxvYWQucWluaXUuY29tIiwiLUggdXAucWluaXUuY29tIGh0dHA6Ly8xODMuMTMxLjcuMTgiXSwiZ2xvYmFsIjpmYWxzZX0=',
    domain: 'http://englishgo.bkt.clouddn.com',
    shouldUseQiniuFileName: false
  };
  qiniuUploader.init(options);
}

var filePath;
var app = getApp()

Page({
  data: {
    assignment: null,
    content: null,
    voice: null,
    lesson: null,
    recording_path: null,
    userInfo: {}
  },

  startRecording: function () {
    var that = this
    wx.startRecord({
      success: function (res) {
        that.setData({
          recording_path: res.tempFilePath
        })
        console.log(that.data.recording_path)
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
      filePath: that.data.recording_path,
      complete: function () {
      }
    })
  },

  uploadVoice: function() {
    var that = this
    var filePath = that.data.recording_path

    qiniuUploader.upload(filePath, (res) => {
      console.log("I'm here!!!!!!!!");

      console.log(res);
      that.setData({
        'recording': res.key
      });
    }, (error) => {
      console.error('error: ' + JSON.stringify(error));
    });

  },

  // downloadVoice: function (){
  //   wx.downloadFile({
  //   url: 'https://example.com/audio/123', //仅为示例，并非真实的资源
  //   success: function(res) {

  //       if (res.statusCode === 200) {
  //           wx.playVoice({
  //             filePath: res.tempFilePath
  //         })
  //       }
  //     }
  //   })
  // },
  onLoad: function (options) {
    initQiniu();
    console.log(options)
    var that = this
    var id = options.assignment
    that.setData({
      lesson_id: options.lesson
    })
    var openId = app.globalData.open_id
    var authToken = app.globalData.authentication_token
    var endpoint = `http://localhost:3000/api/v1/assignments/${id}` // `https://english-go.herokuapp.com/api/v1/assignments/${id}`
    wx.request({
      url: endpoint,
      data: {
        user_open_id: openId,
        user_token: authToken
      },
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

  bindSubmission: function(event){
    var that = this
    //  var assignmentId = that.assignment
    var lessonId = that.data.lesson_id
    var openId = app.globalData.open_id
    var authToken = app.globalData.authentication_token

    that.uploadVoice()

    this.setData({
      loading: !this.data.loading
    })

    wx.request({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/submissions', // 'https://english-go.herokuapp.com/api/v1/submissions',
      data: {
        user_open_id: openId,
        user_token: authToken,
        lesson_id: lessonId,
        submission: {
          voice: 'temp',
          content: "Good!"
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
