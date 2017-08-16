//严格模式
"use strict";
/* 
    要求:
        1.点击-号按钮缩小图片
        2.点击+号按钮放大图片
        3.点击裁切按钮 将图片裁切部分在右边显示
        4.点击上传图像按钮 更换图片
        5.鼠标按下后拖动图片
        6.鼠标滚动放大或缩小图片
*/
; (function (factory) {
    //判断是异步模式还是全局模式
    if (typeof define === 'function' && define.amd) {
        //AMD(异步模块定义)模式
        define(['jquery'], factory);
        console.log(1);
    } else {
        //全局模式
        factory(jQuery);
        console.log(2);
    }
}(function ($) {
    //定义函数
    var cropbox = function (options, el) {
        //如果没有传入参数el
        var el = el || $(options.imageBox),

            obj =
                {
                    state: {},
                    ratio: 1,
                    options: options,
                    imageBox: el,
                    thumbBox: el.find(options.thumbBox),
                    spinner: el.find(options.spinner),
                    image: new Image(),
                    //获取裁切图片的dataURL
                    getDataURL: function () {
                        //获取图片选择框的宽,高
                        var width = this.thumbBox.width(),
                            height = this.thumbBox.height(),
                            //创建一个画布
                            canvas = document.createElement("canvas"),
                            //把背景位置分隔-->空格
                            dim = el.css('background-position').split(' '),
                            //把背景尺寸分隔
                            size = el.css('background-size').split(' '),

                            //裁切图片的位置
                            dx = parseInt(dim[0]) - el.width() / 2 + width / 2,
                            dy = parseInt(dim[1]) - el.height() / 2 + height / 2,
                            //裁切图片的长度
                            dw = parseInt(size[0]),
                            dh = parseInt(size[1]),
                            //图片的长宽
                            sh = parseInt(this.image.height),
                            sw = parseInt(this.image.width);
                        //画布的宽高赋值
                        canvas.width = width;
                        canvas.height = height;

                        var context = canvas.getContext("2d");
                        //用九参模式绘制图片
                        context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
                        //canvas的toDataURL方法-->将canvas里面的内容转化为png格式

                        //canvas的toDataURL()方法可以将画布内容转换为图片 dataURL
                        var imageData = canvas.toDataURL('image/png');//谷歌浏览器要使用localhost;

                        return imageData;
                    },

                    //放大图片事件
                    zoomIn: function () {
                        this.ratio *= 1.1;
                        setBackground();
                    },
                    //缩小图片事件
                    zoomOut: function () {
                        this.ratio *= 0.9;
                        setBackground();
                    }
                },
            //设置背景图片事件
            setBackground = function () {
                //图片宽高
                var w = parseInt(obj.image.width) * obj.ratio;
                var h = parseInt(obj.image.height) * obj.ratio;
                //图片的位置
                var pw = (el.width() - w) / 2;
                var ph = (el.height() - h) / 2;
                //设置图片样式
                el.css({
                    'background-image': 'url(' + obj.image.src + ')',
                    'background-size': w + 'px ' + h + 'px',
                    'background-position': pw + 'px ' + ph + 'px',
                    'background-repeat': 'no-repeat'
                });
            },
            //设置鼠标按下事件
            imgMouseDown = function (e) {
                //阻止剩下的事件处理程序被执行
                e.stopImmediatePropagation();
                //dragable-->图片是否可以拖动-->true为可以拖动
                obj.state.dragable = true;
                //获取鼠标按下位置
                obj.state.mouseX = e.clientX;
                obj.state.mouseY = e.clientY;
            },
            //设置鼠标移动事件
            imgMouseMove = function (e) {

                e.stopImmediatePropagation();
                //如果dragable为true
                if (obj.state.dragable) {

                    var x = e.clientX - obj.state.mouseX;
                    var y = e.clientY - obj.state.mouseY;

                    var bg = el.css('background-position').split(' ');
                    //图片选择框选择中的图片部分位置
                    var bgX = x + parseInt(bg[0]);
                    var bgY = y + parseInt(bg[1]);

                    el.css('background-position', bgX + 'px ' + bgY + 'px');

                    obj.state.mouseX = e.clientX;
                    obj.state.mouseY = e.clientY;
                }
            },
            //鼠标松开事件
            imgMouseUp = function (e) {
                e.stopImmediatePropagation();
                //图片不可以拖动
                obj.state.dragable = false;
            },
            //鼠标滚轮放大或缩小图片
            zoomImage = function (e) {
                e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? obj.ratio *= 1.1 : obj.ratio *= 0.9;
                //鼠标滚动完设置背景图片
                setBackground();
            }
        //show出来
        obj.spinner.show();
        //设置图片加载完成后才能使用上面的方法
        obj.image.onload = function () {
            //先隐藏
            obj.spinner.hide();
            //调用设置背景图片事件
            setBackground();

            el.bind('mousedown', imgMouseDown);
            el.bind('mousemove', imgMouseMove);
            $(window).bind('mouseup', imgMouseUp);
            //mousewheel鼠标滚轮事件
            el.bind('mousewheel DOMMouseScroll', zoomImage);
        };
        obj.image.src = options.imgSrc;
        
        el.on('remove', function () { $(window).unbind('mouseup', imgMouseUp) });

        return obj;
    };
    //封装jQuery插件
    jQuery.fn.cropbox = function (options) {
        return new cropbox(options, this);
    };
}));
