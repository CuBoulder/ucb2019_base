
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
        var self = this; // create a closure to access component in the callback below
        let jsonURL = self.dataurl;
        if(jsonURL !== '') {
            jQuery.getJSON(jsonURL, function (data) {
                if(data.data) {
                    self.posts = data.data;
                    // check to see if we received any real data
                    if (self.posts[0].attributes.title) {
                        children.hasChildren = true;
                    }
                }
            }).fail(function () {
                self.error = "Unable to parse JSON data from specified URL.";
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
        var self = this; // create a closure to access component in the callback below
        let jsonURL = self.dataurl;
        if(jsonURL !== '') {
            jQuery.getJSON(jsonURL, function (data) {
                if(data.data) {
                    self.posts = data.data;
                    // check to see if we received any real data
                    if (self.posts[0].attributes.title) {
                        children.hasChildren = true;
                    }
                }
            }).fail(function () {
                self.error = "Unable to parse JSON data from specified URL.";
            });
        }else {
            self.error = 'Data URL not defined, please check your configuration and retry your request.';
        }
    }
});

Vue.component('ucb-parent-org', {
   props: {
       dataurl: ''
   },
    data: function () {
        return {
            error: '',
            posts: [],
        }
    },
    mounted() {
       var self = this;
       let jsonURL = self.dataurl;
       if(jsonURL !== '') {
           jQuery.getJSON(jsonURL, function (data) {
               if(data.data) {
                   self.posts = data.data;
                   // check to see if we received any real data
                   if(self.posts[0].attributes.title) {
                     parent.foundParent = true;
                     jQuery('#vue-parent-org').show();
                   }
               }
           }).fail(function () {
               self.error = "Unable to parse JSON data from specified URL.";
           });
       }else {
           self.error = 'Data URL not defined, please check your configuration and retry your request.';
       }

       if(self.error) {
           console.log(self.error);
       }
    }
});

Vue.component('ucb-guides-org', {
  props: {
    dataurl: ''
  },
  data: function () {
    return {
      error: '',
      guides: [],
    }
  },
  mounted() {
    var self = this;
    let jsonURL = self.dataurl;
    if(jsonURL != '') {
      jQuery.getJSON(jsonURL, function (data) {
        if(data.data) {
          self.guides = data.data;
          //check to see if we received any real data and not just an empty set
          if(self.guides[0].attributes.title) {
            guide.guidesFound = true;
            jQuery('.ucb-org-addtional-content-section').show();
          }
        }
      }).fail(function () {
        self.error = 'Unable to parse JSON data from specified URL.';
      });
    }else  {
      self.error = 'Data URL not defined, please check your configuration and retry your request.';
    }

    if(self.error) {
      console.log(self.error);
    }
  }
});

// var children = new Vue({
//     el: '#vue-organization-children',
//     data: function () {
//         return {
//             hasChildren: false
//         }
//     }
// });

var parent = new Vue({
    el: '#vue-parent-org',
    data: function () {
        return {
            foundParent: false
        }
    }
});

var guide = new Vue({
  el: '#vue-guides-org',
  data: function () {
    return {
      guidesFound: false
    }
  }
});
