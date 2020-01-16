// Vue.JS code to deal with the dynamic loading of updated events for Incidents

import store from './store';

Vue.component('ucb-incident-event', {
  props: {
    dataurl: ''
  },
  data: function () {
    return {
      error: '',
      posts: '',
    }
  },
  computed: {
    TEST() {
      return this.$store.getters.getTest;
    },
    ERROR() {
      return this.$store.getters.getErrorMsg;
    },
    INCIDENT_COUNT() {
      return this.$store.getters.getIncidentUpdateCount;
    },
    GET_INCIDENT_IDS() {
      return this.$store.getters.getIncidentEventIDs.reverse();
    },
    GET_INCIDENT_DATA() {
      return this.$store.getters.getIncidentEventData;
    },
    GET_LOADED_STATE() {
      return this.$store.getters.getLoaded;
    }
  },
  methods: {
    GET_INCIDENT_DATA_BY_ID(searchID) {
      // return this.$store.getters.getIncidentEventData.find( ({id}) => id === searchID );
      return this.$store.state.IncidentDetails.find( ({id}) => id === searchID );
    //  return "You called me with : " + searchID;
    },
    /**
     * @return {string}
     */
    GET_INCIDENT_TIMESTAMP(incidentID) {
      // let incidentUpdate =  this.$store.state.IncidentDetails.find( ({id}) => id === incidentID );
      //
      // // there's a race condition here... put in a wait if we didn't get any data
      // if(incidentUpdate === undefined) {
      //   console.log('Could not find Timestamp for ID : ' + incidentID);
      //   return '';
      // }
      // console.log('Timestamp for ' + incidentID + ' is ' + incidentUpdate.data.attributes.field_ucb_incident_timestamp);
      // return incidentUpdate.data.attributes.field_ucb_incident_timestamp;

      let incidentUpdate = this.$store.state.IncidentDetails.find(function (v) {
        return v.data.id === incidentID;
      });
      if(incidentUpdate === undefined) {
        return '';
      }

      return incidentUpdate.data.attributes.field_ucb_incident_timestamp;
    },
    /**
     * @return {string}
     */
    GET_INCIDENT_BODY(incidentID) {
//      let incidentUpdate =  this.$store.state.IncidentDetails.find( v => v.data.id === incidentID );
      let incidentUpdate =  this.$store.state.IncidentDetails.find(function (v) {
         return v.data.id === incidentID;
      });
      if(incidentUpdate === undefined) {
        return '';
      }
      return incidentUpdate.data.attributes.field_ucb_incident_body.value;
    },
    /**
     * @return {string}
     */
    GET_INCIDENT_MAP(incidentID) {
      let incidentUpdate = this.$store.state.IncidentDetails.find(function (v) {
        return v.data.id === incidentID;
      });
      if(incidentUpdate === undefined) {
        return '';
      }

      let mapLink = incidentUpdate.data.attributes.field_ucb_incident_map_link;
      let mapID = '';

      if(!mapLink) {
        // do we even have a link to work with?
        return '';
      } else if(mapLink.includes('colorado.edu/map')) {
        // get the ID off of the end of the colorado.edu URL for the map
        mapID = mapLink.split("/").pop();
      } else if(mapLink.match(/^[0-9]+$/) != null) {
        // we don't have a colorado.edu URL but maybe we just have the ID number
        mapID = mapLink;
        mapLink = "https://www.colorado.edu/map/?id=336#!m/" + mapID;

        return `<div class="ucb-org-map-embed">
                <a href="${mapLink}" style="display:block; width:100%; height:300px; background-size: cover; background-image:url(https://staticmap.concept3d.com/map/static-map/?map=336&loc=${mapID});">
                    <span class="embed-map-label"> View location on the Campus Map </span>
                </a>
              </div>`;
      }

      // otherwise we've got something else we don't know how to render
      return '';
    },
    GET_INCIDENT_LINKS(incidentID) {
      let returnLinks = [];
      let incidentUpdate = this.$store.state.IncidentDetails.find(function (v) {
        return v.data.id === incidentID;
      });
      if(incidentUpdate === undefined) {
        return returnLinks;
      }

      for(const linkItem in incidentUpdate.data.attributes.field_ucb_incident_links) {
        let linkTitle = incidentUpdate.data.attributes.field_ucb_incident_links[linkItem].title;
        let linkURI = incidentUpdate.data.attributes.field_ucb_incident_links[linkItem].uri;
        if(linkTitle == '') {
          linkTitle = linkURI;
        }
        let linkHTML = "<a href='" + linkURI + "'>" + linkTitle + "</a>";

        returnLinks.push(linkHTML);
      }
      return returnLinks;
    },
    /**
     * @return {string}
     */
    GET_INCIDENT_IMAGES(incdidentID) {
      let incidentUpdate = this.$store.state.IncidentDetails.find(function (v) {
        return v.data.id === incdidentID;
      });
      if(incidentUpdate === undefined) {
        return '';
      }
      let IMAGES = [];
      let IMG_HTML = "";

      if(incidentUpdate.included !== undefined) {
        for (let imgIndex in incidentUpdate.included) {
          if (incidentUpdate.included[imgIndex].type == 'media--image') {
            // the url will be in the next array item
            imgIndex++;
            if (incidentUpdate.included[imgIndex].type == 'file--file') {
              console.log("Found an image : " + incidentUpdate.included[imgIndex].attributes.uri.url);
              IMAGES.push(incidentUpdate.included[imgIndex].attributes.uri.url);
            }
          }
        }
      }

      if(IMAGES.length)  {
        for(let img in IMAGES) {
          let imgDATA =  `<div class="col-sm-12 col-md-6 col-lg-4 ucb-incident-event-image">
                             <a href="${IMAGES[img]}">
                                <img src="${IMAGES[img]}" alt="foobar"i typeof="foaf:Image">
                              </a>
                          </div>`;

          IMG_HTML += imgDATA;
        }
      }

      return IMG_HTML;
    }
  },
  mounted() {
    var self = this;
    var eventCount = 0;
    var IncidentEventsData = [];
    let jsonURL = self.dataurl;
    if(jsonURL !== '') {
      axios
        .get(jsonURL)
        .then(response => {
          store.dispatch("setTest", "Loading data from : " + jsonURL);
          this.posts = response.data.data;
          //determine how many Incident updates we have
          IncidentEventsData = this.posts.relationships.field_ucb_incident_events.data;
          eventCount = IncidentEventsData.length;

          // loop through all of the Incident Updates ...
          for(const event in IncidentEventsData) {
            //store the IDs of all the Incidents we've found ...
            store.dispatch("addIncidentEventId", IncidentEventsData[event].id);

            // get the JSON data for that event and save it
            store.dispatch("addIncidentEventData", IncidentEventsData[event].id);
          }
        })
        .catch(error => {
          this.error = error;
          console.log(error);
          store.dispatch("setError", error);
        })
    }else {
      store.dispatch("setError", 'Data URL not defined, please check your configuration and retry your request.');
    }

    if(this.$store.getters.getErrorMsg) {
      console.log(this.$store.getters.getErrorMsg);
    }

  }
});

var Incident = new Vue({
  el: '#vue-incident',
  store
});
