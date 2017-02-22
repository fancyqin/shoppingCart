// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview
 * @author qinfan@made-in-china.com
 * @version v1.0
 */

/**
 * @name ShoppingCart
 * @class Shopping Cart 
 * @requires Clazz
 * @constructor ShoppingCart
 * @param {Object} config 组件配置
 * @example 示例文档
 * @description 描述
 */

;(function(root, factory){
    if (typeof module !== 'undefined' && module.exports) {// CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {// AMD / RequireJS
        define(factory);
    } else {
        root.ShoppingCart = factory.call(root);
    }
}(this,function(){

    'use strict';

    var noop = function(){};
    //单例
    var singleton = null;

    var cache;
    var win = window;
    var store = win.localStorage;

    //接口
    var IShoppingCart = new Abstract({
        /**
         * 增加数据 
         * 增加 cart.add(data); 
         * @param {Object} data 新增的数据项
         * 回调 cart.on('add',function(data){});
         * @param {Array} data 数据
        */
        add: noop,
        /**
         * 删除数据 
         * 删除 cart.delete(id); 
         * @param {String} id 删除的数据项id
         * 回调 cart.on('delete',function(data){});
         * @param {Array} data 数据
        */
        delete: noop,
        /**
         * 编辑数据 
         * 编辑 cart.edit(data); 
         * @param {Object} id 编辑的数据项
         * 回调 cart.on('edit',function(data){});
         * @param {Array} data 数据
        */
        edit: noop,
        /**
         * 清空数据 
         * 清空 cart.clean(); 
         * 回调 cart.on('clean',function(){});
        */
        clean: noop,
        error: noop,
        /**
         * 显示整个容器
         * cart.show(); 
        */
        show: noop,
        /**
         * 隐藏整个容器 
         * cart.hide(); 
        */
        hide: noop
    });

    // 默认配置
    var conf = {
        elems: {
            carrier:'.J-ShoppingCart',
        },
        txt:{
            DATA_KEY:'prods',           //ajax数据key值
            LOCALKEY:'ShoppingCart',    //localStorage 数据key值
            LOCAL_UPDATEFLAG:'udFlag'   //localStorage update标识key值
        },
        url:{
            getData:'/getData',
            postData:'/postData'
        }
    };

    if ( !Array.prototype.forEach ) {
        Array.prototype.forEach = function forEach( callback, thisArg ) {
            var T, k;
            if ( this == null ) {
                throw new TypeError( "this is null or not defined" );
            }
            var O = Object(this);
            var len = O.length >>> 0; 
            if ( typeof callback !== "function" ) {
                throw new TypeError( callback + " is not a function" );
            }
            if ( arguments.length > 1 ) {
                T = thisArg;
            }
            k = 0;
            while( k < len ) {
                var kValue;
                if ( k in O ) {
                    kValue = O[ k ];
                    callback.call( T, kValue, k, O );
                }
                k++;
            }
        };
    }
    function isFunc (fn){
        return (Object.prototype.toString.call(fn) === '[object Function]')
    }
    function isArray(ary){
        return (Object.prototype.toString.call(ary) === '[object Array]')
    }


    var ShoppingCart = new Clazz(IShoppingCart,{config: conf,inherit: Component},function(conf){
        if(singleton){
            return singleton;
        }
        this.setConfig(conf);
        this.cache = cache;
        this.__init();
        
        singleton = this;
    });

    

    //API
    ShoppingCart.extend({
        __init: function(){
            var _this = this;
            this.__getAjaxData(function(){
                _this._render();
            });
        },
        __getAjaxData: function(cb){
            var _this = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', this.config.url.getData, true);
            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status >= 200 && this.status < 400) {
                        // Success!
                        var resp = this.responseText;
                        var rData = JSON.parse(resp)[_this.config.txt.DATA_KEY];
                        
                        _this.cache = rData;
                        if (store){
                            _this.__localSet(rData);
                            _this.__flagLocalSet(true);
                        }
                        if(isFunc(cb)){
                            cb(rData);
                        }
                        
                    } else {
                        // Error :(
                        _this.error();
                    }
                }
            };
            xhr.send();

        },
        __postAjaxData: function(cb){
            //todo post
            var formData = new FormData();
            formData.append('data',this.cache);
            var _this = this;
            var xhr = new XMLHttpRequest();
            xhr.open('POST', this.config.url.postData, true);
            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status >= 200 && this.status < 400) {
                        // Success!
                        var resp = this.responseText;
                        //todo

                        if(isFunc(cb)){
                            cb();
                        }
                    } else {
                        // Error :(
                        _this.error();
                    }
                }
            };
            xhr.send(formData);
            
        },
        __localGet: function(){
            this.cache = JSON.parse(store.getItem(this.config.txt.LOCALKEY));
        },
        __localSet: function(){ 
            store.setItem(this.config.txt.LOCALKEY, JSON.stringify(this.cache));
        },
        __flagLocalSet: function(bol){
            store.setItem(this.config.txt.LOCAL_UPDATEFLAG, bol)
        },
        __flagLocalGet: function(){
            return store.getItem(this.config.txt.LOCAL_UPDATEFLAG);
        },
        _update: function(cb){
            if(!store){
                this.__getAjaxData(cb);
            }else if (this.__flagLocalGet()){
                cb();
            }else{
                this.__localGet();
                cb();
            }
        },
        _upload: function(cb){
            if(!store){
                this.__postAjaxData(cb);
            }else{
                this.__localSet();
                cb();
            }
        },
        _render: function(){
            //render DOM
            if(!this.cache){
                return;
            }
            if(document.querySelector){
                this.carrier = document.querySelectorAll(this.config.elems.carrier);
            }else{
                //IE67 兼容 todo
            }
            if(this.carrier.length === 0 ){
                return;
            }
            
            //todo
            this.carrier[0].innerHTML = JSON.stringify(this.cache);
            
        },
        _isDataRight: function(){
            if(isArray(this.cache)){
                return true;
            }else{
                this.error();
                return false;
            }
        },
        add: function(data){
            var _this = this;
            this._update(function(){
                if(_this._isDataRight()){
                    _this.cache.push(data);

                    _this._upload(function(){
                        _this.__flagLocalSet(false);
                        //_this.config.txt.DATA_KEY
                        _this.fire('add',{prods:_this.cache});
                    })
                }
                
                //默认dom add操作 todo
                _this._render();
            })
        },
        delete: function(id){
            var _this = this;
            this._update(function(){
                if(_this._isDataRight()){
                    
                }
                _this.__flagLocalSet(false);
                _this.fire('delete',_this.cache);
                
                //默认dom delete todo
            })
        },
        edit: function(){
            var _this = this;
            this._update(function(){
                //todo edit data 操作
                
                _this.__flagLocalSet(false);
                _this.fire('edit',_this.cache);
                
                //默认dom edit todo
            })
        },
        clean: function(){
            var _this = this;
            this._update(function(){
                //todo add Clean 操作
                
                _this.__flagLocalSet(false);
                _this.fire('clean');

            })
        },
        error:function(code){
            win.console && console.error('error')
        },
        show: function(){
            document.querySelector(this.config.elems.carrier).style.display = "block";
        },
        hide: function(){
            document.querySelector(this.config.elems.carrier).style.display = "none";
        }
    })
    
    return ShoppingCart;

}))


var shop = new ShoppingCart({
    elems:{
        carrier:'.J-fef'
    },
    url:{
        getData:'/data.json'
    }
});




shop.on('clean',function(){
    console.log('clean over')
})


shop.on('add',function(data){
    console.log(data)
})