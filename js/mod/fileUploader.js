define(function(require, exports, module) {

    return function() {
        var imgList = ['../img/1.jpg','../img/2.jpg','../img/3.jpg','../img/4.jpg'], i = 0;

        var that = this;

        that.onSuccess = function(uploadValue){}

        this.openChooseFileWin = function(){
            setTimeout(function(){
                that.onSuccess(imgList[i++]);
                if(i == imgList.length) {
                    i = 0;
                }
            },1000);
        }
    }
});