(function(){
    var show_tabs = $('#show_tabs');
    var save_tabs = $('#save_tabs');
    var add_tabs = $('#add_tabs');
    var added_list = $('#added_list');
    var back = $('#back');
    var pop_over = $('.popup-over');
    var TABPREFIX = 'tabs_array_';
    var NODATA = 'No Data！';
    var mouseTimer;
    var pannelType = '';
    var LiItem = function(obj){
        this.tpl = $("<li class=\"item\" data-index=\""+obj.i+"\"><div class=\"cf\"><span class=\"item-count\"><h4>"+(obj.i+1)+"</h4></span><div class=\"item-value\"><div class=\"value-top\">"+obj.item.name+"</div><div class=\"value-bottom\"><span class=\"time-value\">"+obj.item.time+"</span><i class=\"detail-value fa fa-list-alt\"></i><i class=\"remove-value fa fa-trash-o\"></i></div></div></div></li>");
    };
    LiItem.prototype.getTpl = function(){
        return this.tpl;
    };
    var LiDetailItem = function(obj){
        this.tpl = $("<li data-index-id=\""+obj.id+"\"><img "+this.formatImgUrl(obj.favIconUrl)+" class=\"detail-img\"/><a class=\"detail-url\" title=\""+obj.title+"\" href=\""+obj.url+"\">"+obj.url+"</a><i class=\"fa fa-times remove-url\"></i></li>");
    };
    LiDetailItem.prototype.getTpl = function(){
        return this.tpl;
    };
    LiDetailItem.prototype.formatImgUrl = function(value){
        var strRegex = "favicon.ico";
        var result = '';
        if (new RegExp(strRegex).test(value)) {
            result = "src=\""+value+"\"";
        }
        return result;
    };
    var getDetailItem = function(){
        return $("<div class=\"item-detail\"><ul></ul></div>");
    };
    var dateFormat = function(){
        var date = new Date();
        var year = date.getFullYear();
        var month = (date.getMonth() + 1) < 10 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);
        var day = date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate();
        return year + '/' + month + '/' + day;
    };
    var findWhere = function(array,obj){
        for (var i = 0,length = array.length ; i < length ; i++) {
            var index = null;
            for (var key in obj) {
                if (array[i].hasOwnProperty(key)) {
                    if (array[i][key] == obj[key]) {
                        index = i;
                    }
                } else {
                    index = null;
                }
            }
            if (index != null) {
                return array[index];
            }
        }
    };
    var Popup = function(){
        this.parentTpl = $('.popup-content');
        this.confirmTpl = $("<h3>Delete?</h3><div class=\"confirm-botton\"><button class=\"ok-button\">Confirm</button><button class=\"no-button\">Cancel</button></div>");
        this.inputTpl = $("<input type=\"text\" maxlength=\"12\" class=\"tabs-name\" /><button class=\"submit-name\">Submit</button>");
        this.init = function(){
            this.parentTpl.html('');
            this.parentTpl.find('button').off();
            this.inputTpl.filter('.tabs-name').val('');
        }
        this.init();
    };
    Popup.prototype.getConfirm = function(callback){
        this.parentTpl.append(this.confirmTpl);
        this.show();
        this.confirmTpl.find('.ok-button').on('click',callback);
        this.confirmTpl.find('.no-button').on('click',this.hide);
    };
    Popup.prototype.getInput = function(callback,name){
        this.parentTpl.append(this.inputTpl);
        if (name) {
            this.inputTpl.filter('.tabs-name').val(name);
        }
        this.show();
        this.inputTpl.filter('.tabs-name').focus();
        $('.submit-name').on('click',callback);
    };
    Popup.prototype.hide = function(){
        $('.popup-over').hide();
    };
    Popup.prototype.show = function(){
        $('.popup-over').show();
    };
    function createTab(url){
        chrome.tabs.create({'url':url},function(tab){
        })
    };
    function getTab(callback){
        chrome.tabs.getAllInWindow(function (tabs){
            callback(tabs);
        });
    };
    function getSingleTab(callback){
        chrome.tabs.getSelected(function (tab){
            callback(tab);
        });
    };
    pop_over.click(function(event){
        if ($(event.target).attr('id') == 'popup_over') {
            $('.popup-over').hide();
        }
        
    });
    back.click(function(event){
        $('.container-1').show().siblings().hide();
    });
    show_tabs.click(function(){
        pannelType = 'show';
        renderList();
    });
    save_tabs.click(function(){
        pannelType = 'save';
        renderList();
    });
    add_tabs.click(function(){
        var popup = new Popup();
        popup.getInput(function(){
            var index = 0;
            if (window.localStorage.length != 0) {
                var li = added_list.children('li');
                index = parseInt(li.last().data('index')) + 1;
                if (index >= 5) {
                    alert('max');
                    return;
                }
            }
            getTab(function(tabs){
                var obj = {
                    'name' : $('.tabs-name').val() || 'no-name',
                    'time' : dateFormat(),
                    'data' : tabs
                };
                window.localStorage.setItem(TABPREFIX + index,JSON.stringify(obj));
                renderList();
            });
        });
    });
    added_list.delegate('.item-count', 'click', function(event){
        var current = $(event.currentTarget).parents('.item');
        var index = parseInt(current.data('index'));
        if (pannelType == 'save') {
            var popup = new Popup();
            popup.getInput(function(event){
                getSingleTab(function(tab){
                    var current = JSON.parse(window.localStorage.getItem(TABPREFIX + index));
                    current.name = $('.tabs-name').val() || 'no-name';
                    current.time = dateFormat();
                    current.data.push(tab);
                    window.localStorage.setItem(TABPREFIX + index,JSON.stringify(current));
                    renderList();
                });
            },JSON.parse(window.localStorage.getItem(TABPREFIX + index)).name);
        } else {
            var tabs = JSON.parse(window.localStorage.getItem(TABPREFIX + index));
            for (var i = tabs.data.length - 1; i >= 0; i--) {
                createTab(tabs.data[i].url);
            };
        }
    });
    added_list.delegate('.detail-value', 'click', function(event){
        var current = $(event.currentTarget);
        current.parents('.item-value').parent().next('.item-detail').toggle();
    });
    pop_over.delegate('.tabs-name', 'keyup', function(event){
        if (event.keyCode == 13) {
            $('.submit-name').click();
        }
    });
    added_list.delegate('.remove-url', 'click', function(event){
        var current = $(event.currentTarget);
        var index = current.parents('li.item').data('index');
        var item = window.localStorage.getItem(TABPREFIX + index);
        item = JSON.parse(item);
        var itemDetail = findWhere(item.data,{id:current.parent().data('index-id')});
        item.data.splice(item.data.lastIndexOf(itemDetail),1);
        window.localStorage.setItem(TABPREFIX + index,JSON.stringify(item));
        current.parent().fadeOut();
    });
    added_list.delegate('.detail-url', 'mousedown', function(event){
        var down_date = new Date();
        mouseTimer = setInterval(function(){
            if (new Date() - down_date > 800 && pannelType == 'save') {
                $(event.currentTarget).next('.remove-url').show().addClass('bounceIn animated');
                clearInterval(mouseTimer);
            } 
        },10);
    });
    added_list.delegate('.detail-url', 'mouseup', function(event){
        clearInterval(mouseTimer);
        if (!$(event.currentTarget).next('.remove-url').is(':visible')) {
            var current = $(event.currentTarget);
            createTab(current.attr('href'));
        }
    });
    $('.author').click(function(){
        var current = $(event.target);
        createTab(current.data('href'));
    });
    added_list.delegate('.remove-value', 'click', function(event){
        var popup = new Popup();
        popup.getConfirm(function(){
            event.stopPropagation();
            event.preventDefault();
            var current = $(event.currentTarget).parents('.item');
            var index = parseInt(current.data('index'));
            window.localStorage.removeItem(TABPREFIX + index);
            var i = 0;
            for (var item in window.localStorage) {
                window.localStorage.setItem(TABPREFIX + i,window.localStorage[item]);
                i++;
            }
            window.localStorage.removeItem(TABPREFIX + (window.localStorage.length - 1));
            renderList();
        });
    });
    function renderList() {
        added_list.html('');
        for (var i = 0 ; i < 5 ; i++) {
            var item = window.localStorage.getItem(TABPREFIX + i);
            if (item) {
                item = JSON.parse(item);
                var itemTpl = new LiItem({
                    'i' : i,
                    'item' : item
                }).getTpl();
                var detailTpl = getDetailItem();
                for (var j = 0,length = item.data.length; j < length ; j++) {
                    var liTpl = new LiDetailItem(item.data[j]).getTpl();
                    detailTpl.find('ul').append(liTpl);
                }
                itemTpl.append(detailTpl);
                added_list.append(itemTpl);
            } 
        }
        if (window.localStorage.length == 0) {
            added_list.append('<li id=\"no_data\">'+NODATA+'</li>');
        }
        if (pannelType == 'show') {
            added_list.find('.remove-value').remove();
            $('.container-2').find('#add_tabs').hide();
        } else {
            $('.container-2').find('#add_tabs').show();
        }
        $('.container-2').show().siblings().hide();
    }
})();

