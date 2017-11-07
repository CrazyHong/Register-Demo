define(function (require, exports, module) {

    var $ = require('jquery');
    var ImageUploadView = require('mod/imageUploadView');
    var FileUploader = require('mod/fileUploader');//这是用异步任务模拟的文件上传组件

    //$legalPersonIDPic，用来存储已上传的文件信息，上传组件上传成功之后以及ImageUploadView组件删除某个item之后会对$legalPersonIDPic的值产生影响
    var $legalPersonIDPic = $('#legalPersonIDPic-input'),
        data = JSON.parse($legalPersonIDPic.val() || '[]');//data是初始值，比如当前页面有可能是从数据库加载的，需要用ImageUploadView组件呈现出来

    //在文件上传成功之后，将刚上传的文件保存到$legalPersonIDPic的value中
    //$legalPersonIDPic以json字符串的形式存储
    var appendImageInputValue = function ($input, item) {
        var value = JSON.parse($input.val() || '[]');
        value.push(item);
        $input.val(JSON.stringify(value));
    };

    //当调用ImageUploadView组件删除某个item之后，要同步把$legalPersonIDPic中已存储的信息清掉
    var removeImageInputValue = function ($input, uuid) {
        var value = JSON.parse($input.val() || '[]'), index;
        value.forEach(function (item, i) {
            if (item._uuid === uuid) {
                index = i;
            }
        });
        value.splice(index, 1);
        $input.val(JSON.stringify(value));
    };

    var fileUploader = new FileUploader();

    fileUploader.onSuccess = function (uploadValue) {
        var item = {url: uploadValue};
        legalPersonIDPicView.append(item);
        appendImageInputValue($legalPersonIDPic, item);
    };

    var legalPersonIDPicView = new ImageUploadView('#legalPersonIDPic-view', {
        data: data,
        sizeLimit: 4,
        onAppendClick: function () {
            //打开选择文件的窗口
            fileUploader.openChooseFileWin();
        },
        onDelItem: function (data) {
            removeImageInputValue($legalPersonIDPic, data._uuid);
        }
    });
});
