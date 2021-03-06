// Vue.JS code to deal with the dynamic loading of updated events for Incidents

import store from './ucb-vuex-datastore.js';

Vue.component('ucb-incident-factory', {
  props: {
    initialized: false,
    nodeuuid: '',
    fronturl: ''
  },
  data: function () {
    return {
      error: '',
      posts: ''
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
    GET_INLINE_IMAGES() {
      return this.$store.getters.getInlineImages;
    }
  },
  methods: {
    CHECK_FOR_NEW_UPDATES() {
      // console.log("Checking for new updates...");
      let self = this;
      let nodeuuid = self.nodeuuid;
      let frontURL = self.fronturl;
      let Initialized = self.initialized;

      if(!frontURL) {
        console.log('ucb-incident-app.js : factory : Missing <front> url when mounted()');
        frontURL = '/';
      }
      if(!nodeuuid) {
        console.log('ucb-incident-app.js : factory : missing <nodeUUID> to build JSON:API url');
      }else {
        // we need to load the JSON data for the node UUID
        const incidentUUID = encodeURI(nodeuuid);
        const jsonURL = `${frontURL}jsonapi/node/ucb_incident/${incidentUUID}`;
        let eventIds = [];

        // console.log("Loading Incident details from : " + jsonURL);

        axios.get(jsonURL)
          .then(function (response) {
            // let jsonData = JSON.stringify(response.data.data)
            let jsonObject = {};
            Object.assign(jsonObject, response.data.data.relationships.field_ucb_incident_events.data);
            // we should have an object which contains all of the Incident Event Update Ids now
            // loop through those and see if we're missing any
            Object.keys(jsonObject).forEach(function (key) {
              let testID = jsonObject[key].id;
              // console.log('Checking to see if we have loaded paragraph : ' + testID);
              eventIds.push(jsonObject[key].id);
            });

            if(eventIds.length) {
              let storeIds = {};
              storeIds[incidentUUID] = eventIds;
              store.dispatch("addIncidentEventIds", storeIds);
            }
          })
          .catch(function (error) {
            console.log("ucb-incident-app.js : CHECK_FOR_NEW_UPDATES :  (error) : " + error)
          })
          .then(function() {
            // we should have a list of Incident Event Updates now...
            // loop through those and see if we're missing any
            for(let i = 0; i < eventIds.length; i++) {
              let found = self.$store.state.IncidentDetails.find(function (v) {
                return v.data.id === eventIds[i];
              });

              // we have a race condition here... this component will likely start looking for
              // event update ids before the initial event updates have been loaded.
              if(found === undefined && Initialized) {
                console.log("We have a new ID to load in!!!! " + eventIds[i]);
              }
            }
          })
      }

      self.SET_INITIALIZED();
    },
    SET_INITIALIZED() {
      self.initialized = true;
    }
  },
  mounted() {
    setInterval(function () {
      this.CHECK_FOR_NEW_UPDATES();
    }.bind(this), 5000);
  }
});

Vue.component('ucb-incident-event', {
  props: {
    /*
      Paragaph Node UUID for loading the information via the JSON:API endpoint
     */
    nodeid: '',
    /*
      url for the frontpage of this webapp, used in building the JSON urls
     */
    fronturl: ''
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
    GET_INLINE_IMAGES() {
      return this.$store.getters.getInlineImages;
    }
  },
  methods: {
    LOAD_DATA() {
      var self = this;
      let nodeid = self.nodeid;
      let frontURL = self.fronturl;

      if(!frontURL) {
        console.log('ucb-incident-app.js : event : Missing <front> url when mounted()');
        frontURL = '/';
      }

      if(!nodeid) {
        console.log('ucb-incident-app.js : Missing <nodeID> to build JSON:API url');
      }else {
        const paragraphUUID = encodeURI(nodeid);
        const jsonURL = `${this.fronturl}jsonapi/paragraph/ucb_incident_update/${paragraphUUID}?include=field_ucb_incident_images,field_ucb_incident_images.field_media_image`;

        // console.log("Loading : " + jsonURL);
        store.dispatch("addIncidentEventData", jsonURL);
      }

      if(this.$store.getters.getErrorMsg) {
        console.log(this.$store.getters.getErrorMsg);
      }
    },
    GET_INCIDENT_IDS_BY_NODE(nodeID) {
      // console.log('Trying to load updates for Nid : ' + nodeID);
      const eventUpdateData = this.$store.state.IncidentEventIDs;
      for(let i = 0; i < eventUpdateData.length; i++){
        if(nodeID in eventUpdateData[i]) {
          const returnArray = eventUpdateData[i][nodeID];
          // we need the events loaded in reverse chronological order
          // so reverse the array data
          return returnArray.slice().reverse();
        }
      }
      // console.log("Couldn't find any event updates for node ID : " + nodeID);
      // no data yet... return an empty array
      return [];
    },
    GET_INCIDENT_DATA_BY_ID(searchID) {
      // return this.$store.getters.getIncidentEventData.find( ({id}) => id === searchID );
      return this.$store.state.IncidentDetails.find( ({id}) => id === searchID );
      //  return "You called me with : " + searchID;
    },
    /**
     * @return {string}
     */
    GET_INCIDENT_TIMESTAMP(incidentID) {
      let incidentUpdate = this.$store.state.IncidentDetails.find(function (v) {
        return v.data.id === incidentID;
      });
      if(incidentUpdate === undefined) {
        return '';
      }
      // use the Moment.JS library (https://momentjs.com/) to format the date timestamp
      return moment(incidentUpdate.data.attributes.field_ucb_incident_timestamp).format('ddd, MM/DD/YYYY - h:mma');
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

      // we need to determine if there's an inline media-image in there that we have to render.
      let htmlData = incidentUpdate.data.attributes.field_ucb_incident_body.value;

      if(htmlData.includes("<drupal-media")) {
        // we've got an inline-image so let's get that image and substitute it in to the <drupal-media> tag
        const parser = new DOMParser();
        const htmlCode = parser.parseFromString(htmlData, "text/html");
        const mediaElement = htmlCode.querySelectorAll('drupal-media');

        for(let i = 0; i < mediaElement.length; ++i) {
          // console.log("Attempting to load image : " + mediaElement[i].dataset.entityUuid);
          let imageUUID = mediaElement[i].dataset.entityUuid;

          if(imageUUID) {
            let imageHTML = this.GET_INCIDENT_IMAGE(imageUUID);

            if(imageHTML) {
              // Replace the <drupal-media> tag with our <img> tag.
              // console.log("Found image : " + imageHTML);
              let imgAttributes = imageHTML.split(':');
              // let imageHTMLnode = new DOMParser().parseFromString(imageHTML, 'text/html');
              let imageHTMLnode = document.createElement('img');

              if(imgAttributes.length) {
                imageHTMLnode.src = imgAttributes[0];
                imageHTMLnode.alt = imgAttributes[1];

                htmlCode.querySelector('drupal-media[data-entity-uuid="' + imageUUID + '"]').replaceWith(imageHTMLnode);
              }
            }
          }
        }
        let s = new XMLSerializer();
        return s.serializeToString(htmlCode);
      }
      //return incidentUpdate.data.attributes.field_ucb_incident_body.value;
      return htmlData;
    },
    /**
     * @return {string}
     */
    GET_INCIDENT_IMAGE(imageUUID) {
      let returnImg = '';
      if(imageUUID) {
        let inlineImage = this.$store.state.InlineImages.find(function (v) {
          return v.data.id === imageUUID;
        });
        if(inlineImage === undefined) {
          const imageJsonUri = `${this.fronturl}jsonapi/media/image/${imageUUID}?include=field_media_image`;
          // console.log("Attempting to load an image from : " + imageJsonUri);
          // we don't already have the image in storage but we have a UUID... so try to load it
          // so it will be available next time
          store.dispatch("addInlineImage", imageJsonUri);
          // return blank for now... it should be there next time this is called though
          return '';
        }

        // retrieve the image URI
        let imageURL = inlineImage.included[0].attributes.uri.url;
        if(imageURL !== undefined) {
          // retrieve the Alt text for the image
          let altText = inlineImage.data.relationships.field_media_image.data.meta.alt;

          if(altText === undefined) {
            altText = 'Incident Image';
          }
//            returnImg = `<img src="${imageURL}" alt="${altText}" typeof="foaf:Image">`
          returnImg = imageURL + ':' + altText;
        }
      }

      return returnImg
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
      }else {
        // otherwise we've got something else we don't know how to render
        return '';
      }

      mapLink = "https://www.colorado.edu/map/?id=336#!m/" + mapID;
      return `<div class="ucb-org-map-embed">
                <a href="${mapLink}" style="display:block; width:100%; height:300px; background-size: cover; background-image:url(https://staticmap.concept3d.com/map/static-map/?map=336&loc=${mapID});">
                    <span class="embed-map-label"> View location on the Campus Map </span>
                </a>
              </div>`;
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
          if (incidentUpdate.included[imgIndex].type == 'file--file') {
            let imgURI = incidentUpdate.included[imgIndex].attributes.uri.url;
            if(imgURI.match(/\.(jpeg|jpg|png|gif)/g)) {
              // console.log("Found an image : " + incidentUpdate.included[imgIndex].attributes.uri.url);
              IMAGES.push(imgURI);
            }
          }
        }
      }

      if(IMAGES.length)  {
        for(let img in IMAGES) {
          let imgDATA =  `<div class="col-sm-12 col-md-6 col-lg-4 ucb-incident-event-image">
                             <a href="${IMAGES[img]}">
                                <img src="${IMAGES[img]}" alt="foobar" typeof="foaf:Image">
                              </a>
                          </div>`;

          IMG_HTML += imgDATA;
        }
      }

      return IMG_HTML;
    }
  },
  mounted() {
    setInterval(function () {
      // console.log("Reloading Data!");
      this.LOAD_DATA();
    }.bind(this), 5000);
  }
});

const Incident = new Vue({
  el: '#vue-app',
  store
});
