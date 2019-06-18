
Vue.component('ucb-howto', {
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
                }
            }).fail(function () {
                self.error = "Unable to pare JSON data from specified URL (" + jsonURL + ")";
            });
        }else {
            self.error = 'Data URL not defined, please check your configuration and retry your request.';
        }
    }
});

var app = new Vue({
    el: '#vue-app',
});