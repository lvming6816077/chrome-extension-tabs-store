(function(){
    var show_tabs = $('#show_tabs');
    var save_tabs = $('#save_tabs');
    var add_tabs = $('#add_tabs');
    var added_list = $('#added_list');
    function createTab(url){
        chrome.tabs.create({'url':url},function(tab){
        })
    };
    function getTab(callback){
        chrome.tabs.getAllInWindow(function (tabs){
            callback(tabs);
        });
    };
    show_tabs.onclick = function(){
        var tabs = JSON.parse(window.localStorage.getItem('tabs_array'));
        var count = 0;
        for (var i = tabs.length - 1; i >= 0; i--) {
            createTab(tabs[i].url);
        };
        
    };
    add_tabs.click(function(){
        var index = 0;
        var li = added_list.children('li');
        if (li.length) {
            index = parseInt(li.last().data('index')) + 1;
            if (index >= 5) {
                alert('max');
                return;
            }
        } 
        getTab(function(tabs){
            var date = new Date();
            var obj = {
                'time' : date.toLocaleDateString() + '&nbsp;' +date.toLocaleTimeString(),
                'data' : tabs
            };
            window.localStorage.setItem('tabs_array_' + index,JSON.stringify(obj));
            renderList();
        });
        
    });
    save_tabs.click(renderList);
    added_list.delegate('.item-count', 'click', function(event){
        var current = $(event.currentTarget).parent();
        var index = parseInt(current.data('index'));
        getTab(function(tabs){
            var date = new Date();
            var obj = {
                'time' : date.toLocaleDateString() + '&nbsp;' +date.toLocaleTimeString(),
                'data' : tabs
            };
            window.localStorage.setItem('tabs_array_' + index,JSON.stringify(obj));
            renderList();
        });
    });
    added_list.delegate('.detail-value', 'click', function(event){
        event.stopPropagation();
        event.preventDefault();
        var current = $(event.currentTarget);
        current.parents('.item-value').next('.item-detail').toggle();
    });
    added_list.delegate('.detail-url', 'click', function(event){
        event.stopPropagation();
        event.preventDefault();
        var current = $(event.currentTarget);
        createTab(current.attr('href'));
    });
    added_list.delegate('.remove-value', 'click', function(event){
        event.stopPropagation();
        event.preventDefault();
        var current = $(event.currentTarget).parents('.item');
        var index = parseInt(current.data('index'));
        window.localStorage.removeItem('tabs_array_' + index);
        renderList();
    });
    function renderList() {
        $('#added_list').html('');
        for (var i = 0 ; i < 5 ; i++) {
            var item = window.localStorage.getItem('tabs_array_' + i);
            if (item) {
                item = JSON.parse(item);
                var itemTpl = $("<li class=\"item\" data-index=\""+i+"\"><span class=\"item-count\"><h4>"+(i+1)+"</h4></span><div class=\"item-value\"><div class=\"value-top\">"+item.time+"</div><div class=\"value-bottom\"><a href=\"javascript:;\" class=\"detail-value\">Detail</a><a href=\"javascript:;\" class=\"remove-value\">Remove</a></div></div></li>");
                var detailTpl = $("<div class=\"item-detail\"><ul></ul></div>");
                for (var j = 0,length = item.data.length; j < length ; j++) {
                    var liTpl = $("<li><img src=\""+item.data[j].favIconUrl+"\" class=\"detail-img\"/><a class=\"detail-url\" href=\""+item.data[j].url+"\">"+item.data[j].url+"</a></li>");
                    detailTpl.find('ul').append(liTpl);
                }
                itemTpl.append(detailTpl);
                $('#added_list').append(itemTpl);
            }
        }
        $('.container-2').show().siblings().hide();
    }
})();

