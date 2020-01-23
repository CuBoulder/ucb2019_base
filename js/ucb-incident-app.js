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
      },
      GET_INLINE_IMAGES() {
        return this.$store.getters.getInlineImages;
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
            console.log("Attempting to load image : " + mediaElement[i].dataset.entityUuid);
            let imageUUID = mediaElement[i].dataset.entityUuid;

            if(imageUUID) {
              let imageHTML = this.GET_INCIDENT_IMAGE(imageUUID);

              if(imageHTML) {
                // Replace the <drupal-media> tag with our <img> tag.
                console.log("Found image : " + imageHTML);
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
            // we don't already have the image in storage but we have a UUID... so try to load it
            // so it will be available next time
            store.dispatch("addInlineImage", imageUUID);

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
