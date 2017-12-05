var app = getApp()
Page({

  data: {
    assignments: null,
    content: null,
    voice: null,
    lesson: null,
    userInfo: {}
  },

  // have user info passed in when page is opend {user: openid}


  onLoad: function (options) {
    this.checkFetchAssignments()
    // this.fetchAssignments()
  },
  checkFetchAssignments: function () {
    var openId = app.globalData.open_id
    var that = this
    if(typeof openId === 'undefined'){
      return setTimeout(function(){
        console.log('no open id yet?')
        that.checkFetchAssignments()
      }, 1000)
    }
    return this.fetchAssignments()
  },
  fetchAssignments: function(){
    var that = this
    // var endpoint = 'https://english-go.herokuapp.com/api/v1/assignments'
    var openId = app.globalData.open_id
    var authToken = app.globalData.authentication_token
    console.log('loading assignments')
    var endpoint = 'http://localhost:3000/api/v1/assignments'
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
        let list = res.data
        that.setData({
           assignments: list
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
  handleCardTap: function(event) {
    let lessonId = event.currentTarget.dataset.lesson_id
    let id = event.currentTarget.dataset.id
    if (!lessonId) {
      console.log('Hasn\'t started the assignment yet, creating one')
      this.postNewLesson(id)
    } else {
      console.log('Student already started or finished, directly navigating to the page')
      wx.navigateTo({
        url: `../form/form?assignment=${assignmentId}&lesson=${lessonId}`
      })
    }
  },
  postNewLesson: function (assignmentId) {
    console.log(assignmentId)
    var openId = app.globalData.open_id
    var authToken = app.globalData.authentication_token
    wx.request({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/lessons', // change to Heroku when ready
      data: {
        user_open_id: openId,
        user_token: authToken,
        lesson: {
          assignment_id: assignmentId
        }
      },
      success: function (response){
        let res = response.data;
        var lessonId = res.id
        var assignmentId = res.assignment_id
        console.log(response.data)
        wx.navigateTo({
          url: `../form/form?assignment=${assignmentId}&lesson=${lessonId}`
        })
      },
      fail: function (res) {
        console.log(res.data);
        console.log('failed!' + res.statusCode);
      }
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    })
  },

  onShow: function () {

  },


  onHide: function () {

  },

  onUnload: function () {

  },
})
