const productUtil = require('../../utils/product.js') // 封装的产品内容
var app = getApp()

Page({
  data: {
    items: [],
    slides: [],
    navs: [{icon: "../../images/icon-new-list1.png", name: "资产", typeId: 0},
           {icon: "../../images/icon-new-list2.png", name: "直销", typeId: 1},
           {icon: "../../images/icon-new-list3.png", name: "甄选", typeId: 2},
           {icon: "../../images/icon-new-list4.png", name: "管到", typeId: 3}],

    popularity_products: [],
    new_products: [],
    hot_products: [],
    promotions: []
  },

// 分享时候的 标题、描述等
  onShareAppMessage: function () {
    return {
      title: "小程序案例",
      desc: "商城首页",
      path: `pages/index/index`
    }
  },

// 打开相关产品页面，或从网络上拉取
  bindShowProduct: function (e) {
    wx.navigateTo({
      url: `../show_product/show_product?id=${e.currentTarget.dataset.id}`
    })
  },

// 打开 分类页面
  catchTapCategory: function (e) {
    var data = e.currentTarget.dataset
    app.globalData.currentCateType = {typeName: data.type, typeId: data.typeid}
    wx.switchTab({
      url: `../category/category`
    })
  },

// 下拉刷新
  onPullDownRefresh: function() {
    this.getSlidesFromServer()
    this.getProductsFromServer()
    wx.stopPullDownRefresh()
  },

// 载入后 处理函数
  onLoad: function() {
    var that = this


    wx.getStorage({
      key: 'products',
      success: function(res){
        var data = res.data
        that.setData({
          items: data,
          popularity_products: data.filter(product => (product.flag === '最热' && product['promotion-url'])),
          new_products:        data.filter(product => (product.flag === '新品' && product['promotion-url'])),
          hot_products:        data.filter(product => (product.flag === '火爆' && product['promotion-url'])),
        })
      },
      fail: function() {
        console.log('缓存中不存在产品数据')
      },
      complete: function() {
        console.log('完成缓存中产品数据获取')
      }
    })

    wx.getStorage({
      key: 'indexSlides',
      success: function(res){
        that.setData({'slides': res.data})
      },
      fail: function() {
        console.log('缓存中不存在幻灯片数据')
      },
      complete: function() {
        console.log('完成缓存中幻灯片数据获取')
      }
    })
  },

  onReady: function() {
    this.getProductsFromServer()
    this.getSlidesFromServer()
  },

// 从服务器获取幻灯片
  getSlidesFromServer: function() {
    var that = this

    productUtil.getSlides(function(result) {
      var data = app.store.sync(result.data)
      that.setData({'slides': data})   // 设置获取的 图片为 slide
      wx.setStorage({ // 获取，写入缓存
        key:'indexSlides', 
        data:data
      })
    })
  },


// 从服务器获取 产品表单
  getProductsFromServer: function() {
    var that = this
    productUtil.getProducts(function(result) {
      var data = app.store.sync(result.data)
      that.setData({
        items: data,
        popularity_products: data.filter(product => (product.flag === '最热' && product['promotion-url'])),
        new_products:        data.filter(product => (product.flag === '新品' && product['promotion-url'])),
        hot_products:        data.filter(product => (product.flag === '火爆' && product['promotion-url'])),
      })
      wx.setStorage({
        key:'products',
        data:data
      })
    })
  }
})
