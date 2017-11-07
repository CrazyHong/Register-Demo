define(function (require, exports, module) {

    var $ = require('jquery');
    var Class = require('mod/class');
    var EventBase = require('mod/eventBase');

    var DEFAULTS = {
        data: [], //要展示的数据列表，列表元素必须是object类型的，如[{url: 'xxx.png'},{url: 'yyyy.png'}]
        sizeLimit: 0, //用来限制BaseView中的展示的元素个数，为0表示不限制
        readonly: false, //用来控制BaseView中的元素是否允许增加和删除
        onBeforeRender: $.noop, //对应render.before事件，在render方法调用前触发
        onRender: $.noop, //对应render.after事件，在render方法调用后触发
        onBeforeAppend: $.noop, //对应append.before事件，在append方法调用前触发
        onAppend: $.noop, //对应append.after事件，在append方法调用后触发
        onBeforeDelItem: $.noop, //对应delItem.before事件，在delItem方法调用前触发
        onDelItem: $.noop //对应delItem.after事件，在delItem方法调用后触发
    };

    /**
     * 数据处理，给data的每条记录都添加一个_uuid的属性，方便查找
     */
    function resolveData(data) {
        var time = new Date().getTime();
        return $.map(data, function (d) {
            return resolveDataItem(d, time);
        });
    }

    function resolveDataItem(data, time) {
        time = time || new Date().getTime();
        data._uuid = '_uuid' + time + Math.floor(Math.random() * 100000);
        return data;
    }

    var FileUploadBaseView = Class({
        instanceMembers: {
            init: function (element, options) {
                //通过this.base调用父类EventBase的init方法
                this.base(element);

                //实例属性
                var opts = this.options = this.getOptions(options);
                this.data = resolveData(opts.data);
                delete opts.data;
                this.sizeLimit = opts.sizeLimit;
                this.readOnly = opts.readOnly;

                //绑定事件
                this.on('render.before', $.proxy(opts.onBeforeRender, this));
                this.on('render.after', $.proxy(opts.onRender, this));
                this.on('append.before', $.proxy(opts.onBeforeAppend, this));
                this.on('append.after', $.proxy(opts.onAppend, this));
                this.on('delItem.before', $.proxy(opts.onBeforeDelItem, this));
                this.on('delItem.after', $.proxy(opts.onDelItem, this));
            },
            getOptions: function (options) {
                return $.extend({}, this.getDefaults(), options);
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            getDataItem: function (uuid) {
                //根据uuid获取dateItem
                return this.data.filter(function (item) {
                    return item._uuid === uuid;
                })[0];
            },
            getDataItemIndex: function (uuid) {
                var ret;
                this.data.forEach(function (item, i) {
                    item._uuid === uuid && (ret = i);
                });
                return ret;
            },
            render: function () {
                /**
                 * render是一个模板，子类不需要重写render方法，只需要重写_render方法
                 * 当调用子类的render方法时调用的是父类的render方法
                 * 但是执行到_render方法时，调用的是子类的_render方法
                 * 这样就能把before跟after事件的触发操作统一起来
                 */
                var e;
                this.trigger(e = $.Event('render.before'));
                if (e.isDefaultPrevented()) return;

                this._render();

                this.trigger($.Event('render.after'));
            },
            //子类需实现_Render方法
            _render: function () {

            },
            append: function (item) {
                var e;
                if (!item) return;

                item = resolveDataItem(item);

                this.trigger(e = $.Event('append.before'), item);
                if (e.isDefaultPrevented()) return;

                this.data.push(item);
                this._append(item);

                this.trigger($.Event('append.after'), item);
            },
            //子类需实现_append方法
            _append: function (data) {

            },
            delItem: function (uuid) {
                var e, item = this.getDataItem(uuid);
                if (!item) return;

                this.trigger(e = $.Event('delItem.before'), item);
                if (e.isDefaultPrevented()) return;

                this.data.splice(this.getDataItemIndex(uuid), 1);
                this._delItem(item);

                this.trigger($.Event('delItem.after'), item);
            },
            //子类需实现_delItem方法
            _delItem: function (data) {

            }
        },
        extend: EventBase,
        staticMembers: {
            DEFAULTS: DEFAULTS
        }
    });

    return FileUploadBaseView;
});