define(function (require, exports, module) {

    var $ = require('jquery');
    var Class = require('mod/class');
    var FileUploadBaseView = require('mod/fileUploadBaseView');

    //继承并扩展父类的默认DEFAULTS
    var DEFAULTS = $.extend({}, FileUploadBaseView.DEFAULTS, {
        onAppendClick: $.noop //点击上传按钮时候的回调
    });

    var ImageUploadView = Class({
        instanceMembers: {
            init: function (element, options) {
                var $element = this.$element = $(element);
                var opts = this.getOptions(options);

                //调用父类的init方法完成options获取，data解析以及通用事件的监听处理
                this.base(this.$element, options);

                //添加上传和删除的监听器及触发处理
                if (!this.readOnly) {
                    var that = this;
                    that.on('appendClick', $.proxy(opts.onAppendClick, this));

                    $element.on('click.append', '.view-act-add', function (e) {
                        e.preventDefault();
                        that.trigger('appendClick');
                    });

                    $element.on('click.remove', '.view-act-del', function (e) {
                        var $this = $(e.currentTarget);
                        that.delItem($this.data('uuid'));
                        e.preventDefault();
                    });
                }

                this.render();
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            _setItemAddHtml: function () {
                this.$element.prepend($('<li class="view-item-add"><a class="view-act-add" href="javascript:;" title="点击上传">+</a></li>'));
            },
            _clearItemAddHtml: function ($itemAddLi) {
                $itemAddLi.remove();
            },
            _render: function () {
                var html = [], that = this;
                //如果不是只读的状态，并且还没有达到上传限制的话，就添加上传按钮
                if (!(this.readOnly || (this.sizeLimit && this.sizeLimit <= this.data.length))) {
                    this._setItemAddHtml();
                }

                this.data.forEach(function (item) {
                    html.push(that._getItemRenderHtml(item))
                });

                this.$element.append($(html.join('')));
            },
            _getItemRenderHtml: function (item) {
                return [
                    '<li id="',
                    item._uuid,
                    '"><a class="view-act-preview" href="javascript:;"><img alt="" src="',
                    item.url,
                    '">',
                    this.readOnly ? '' : '<span class="view-act-del" data-uuid="',
                    item._uuid,
                    '">删除</span>',
                    '</a></li>'
                ].join('');
            },
            _dealWithSizeLimit: function () {
                if (this.sizeLimit) {
                    var $itemAddLi = this.$element.find('li.view-item-add');
                    //如果已经达到上传限制的话，就移除上传按钮
                    if (this.sizeLimit && this.sizeLimit <= this.data.length && $itemAddLi.length) {
                        this._clearItemAddHtml($itemAddLi);
                    } else if (!$itemAddLi.length) {
                        this._setItemAddHtml();
                    }
                }
            },
            _append: function (data) {
                this.$element.append($(this._getItemRenderHtml(data)));
                this._dealWithSizeLimit();
            },
            _delItem: function (data) {
                $('#' + data._uuid).remove();
                this._dealWithSizeLimit();
            }
        },
        extend: FileUploadBaseView
    });

    return ImageUploadView;
});