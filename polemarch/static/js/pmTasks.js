
var pmTasks = new pmItems()

pmTasks.model.name = "tasks"

pmTasks.execute = function(project_id, inventory, playbook, data_vars)
{
    var def = new $.Deferred();
    if(!playbook)
    {
        $.notify("Playbook name is empty", "error");
        def.reject();
        return def.promise();
    }

    if(!project_id)
    {
        $.notify("Invalid filed `project` ", "error");
        def.reject();
        return;
    }

    if(!inventory)
    {
        $.notify("Invalid filed `inventory` ", "error");
        def.reject();
        return;
    }

    if(data_vars == undefined)
    {
        data_vars = jsonEditor.jsonEditorGetValues();
    }
    
    data_vars.playbook = playbook
    data_vars.inventory = inventory
    $.ajax({
        url: "/api/v1/projects/"+project_id+"/execute-playbook/",
        type: "POST",
        data:JSON.stringify(data_vars),
        contentType:'application/json',
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data) 
        {
            $.notify("Started", "success"); 
            if(data && data.history_id)
            { 
                $.when(spajs.open({ menuId:"project/"+project_id+"/history/"+data.history_id}) ).done(function(){
                    def.resolve()
                }).fail(function(){
                    def.reject()
                })
            }
            else
            {
                def.reject()
            }
        },
        error:function(e)
        {
            def.reject()
            polemarch.showErrors(e.responseJSON)
        }
    })

    return def.promise();
}



/**
 * Обновляет поле модел this.model.itemslist и ложит туда список пользователей
 * Обновляет поле модел this.model.items и ложит туда список инфу о пользователях по их id
 */
pmTasks.loadItems = function(limit, offset)
{
    if(!limit)
    {
        limit = 30;
    }

    if(!offset)
    {
        offset = 0;
    }

    var thisObj = this;
    return jQuery.ajax({
        url: "/api/v1/"+this.model.name+"/",
        type: "GET",
        contentType:'application/json',
        data: "limit="+encodeURIComponent(limit)+"&offset="+encodeURIComponent(offset),
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        {
            //console.log("update Items", data)
            data.limit = limit
            data.offset = offset
            thisObj.model.itemslist = data 

            for(var i in data.results)
            {
                data.results[i].id = data.results[i].playbook
                var val = data.results[i]
                thisObj.model.items.justWatch(val.id);
                thisObj.model.items[val.id] = mergeDeep(thisObj.model.items[val.id], val)
            }
        },
        error:function(e)
        {
            console.warn(e)
            polemarch.showErrors(e)
        }
    });
}

pmTasks.sendSearchQuery = function(query, limit, offset)
{
    if(!limit)
    {
        limit = 999;
    }

    if(!offset)
    {
        offset = 0;
    }

    var q = [];
    for(var i in query)
    {
        q.push(encodeURIComponent(i)+"="+encodeURIComponent(query[i]))
    }

    var thisObj = this;
    return jQuery.ajax({
        url: "/api/v1/"+this.model.name+"/?"+q.join('&'),
        type: "GET",
        contentType:'application/json',
        data: "limit="+encodeURIComponent(limit)+"&offset="+encodeURIComponent(offset),
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        {
            //console.log("update Items", data)
            thisObj.model.itemslist = data

            for(var i in data.results)
            {
                data.results[i].id = data.results[i].playbook

                var val = data.results[i]
                thisObj.model.items[val.id] = val
            }
        },
        error:function(e)
        {
            console.warn(e)
            polemarch.showErrors(e)
        }
    });
}
