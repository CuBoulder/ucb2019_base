
Vue.component('ucb-promoted-children', {
    props: {
        dataurl: ''
    },
    data: function() {
        return {
            error: '',
            posts: []
        }
    },
    mounted() { // when the Vue app is booted up, this is run automatically.
        var self = this // create a closure to access component in the callback below
        let jsonURL = self.dataurl;
        if(jsonURL !== '') {
            jQuery.getJSON(jsonURL, function (data) {
                if(data.data) {
                    self.posts = data.data;
                    // check to see if we received any real data
                    if (self.posts[0].attributes.title) {
                        app.hasChildren = true;
                    }
                }
            }).fail(function () {
                self.error = "Unable to pare JSON data from specified URL.";
            });
        }else {
            self.error = 'Data URL not defined, please check your configuration and retry your request.';
        }
    }
});

Vue.component('ucb-standard-children', {
    props: {
        dataurl: ''
    },
    data: function() {
        return {
            error: '',
            posts: [],
        }
    },
    mounted() { // when the Vue app is booted up, this is run automatically.
        var self = this // create a closure to access component in the callback below
        let jsonURL = self.dataurl;
        if(jsonURL !== '') {
            jQuery.getJSON(jsonURL, function (data) {
                if(data.data) {
                    self.posts = data.data;
                    // check to see if we received any real data
                    if (self.posts[0].attributes.title) {
                        app.hasChildren = true;
                    }
                }
            }).fail(function () {
                self.error = "Unable to pare JSON data from specified URL.";
            });
        }else {
            self.error = 'Data URL not defined, please check your configuration and retry your request.';
        }
    }
});

var app = new Vue({
    el: '#vue-organization-children',
    data: function () {
        return {
            hasChildren: false
        }
    }
});
