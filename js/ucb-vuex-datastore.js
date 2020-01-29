Vue.use(Vuex)
const DEBUG = true

const store = new Vuex.Store({
  state: {
    /*
      String : used for development purposes, primarily just to see if the Vuex
      store is able to read/write data properly.
     */
    test: 'Testing 1... 2... 3... ',
    /*
      Any application-level error message will be stored here
     */
    errorMsg: '',
    /*
      Used by UCB Incident nodes to store the event update details of active
      incidents
     */
    IncidentDetails: [],
    /*
      array of objects
      Used by UCB Incident nodes to store the event update IDs of active incidents
      key format - paragraph UUID
     */
    IncidentEventIDs: [],
    /*
      array of strings
      Used by UCB Incident nodes to store the inline images that are part of
      larger body HTML blocks for incident updates
      format - paragraph UUID
     */
    InlineImages: [],
  },

  getters: {
    getTest: state => {
      return state.test
    },
    getErrorMsg: state => {
      return state.errorMsg
    },
    getIncidentUpdateCount: state => {
      return state.IncidentEventIDs.length
    },
    getIncidentEventIDs : state => {
      return state.IncidentEventIDs
    },
    getIncidentEventData : state => {
      return state.IncidentDetails
    },
    getInlineImages: state => {
      return state.InlineImages
    }

  },

  mutations: {
    SET_TEST : (state, payload) => {
      state.test = payload
    },
    SET_ERROR : (state, payload) => {
     state.errorMsg = payload
    },
    ADD_INCIDENT_EVENT_ID : (state, payload) => {
      // add only unique items (i.e. no dupes)
      if(state.IncidentEventIDs.indexOf(payload) === -1) {
        state.IncidentEventIDs.push(payload)
      }
    },
    ADD_INLINE_IMAGE : (state, payload) => {

      if(!payload.includes('/jsonapi/media/image/')) {
        console.log('ucb-vuex-datastore.js : Likely invalid URL for image load : ' + payload)
        return;
      }

      if(DEBUG) {
        console.log("ucb-vuex-datastore.js : Loading Media Image data from : " + payload)
      }

      axios.get(payload)
        .then(function (response) {
          let jsonData = JSON.stringify(response.data.data)
          let jsonObject = {}

          Object.assign(jsonObject, response.data)
          // save the data if we haven't already loaded this update
          if(!state.InlineImages.find( ({id}) => id === payload) ) {
            state.InlineImages.push(jsonObject)
          }else {
            if(DEBUG) {
              console.log("Not loading duplicate image for : " + payload)
            }
          }
        })
        .catch(function (error) {
          console.log("ADD_INLINE_IMAGE (error) : " + error)
        })
    },
    ADD_INCIDENT_EVENT_DATA : (state, payload) => {

      if(!payload.includes('/jsonapi/paragraph/ucb_incident_update')) {
        console.log('ucb-vuex-datastore.js : Likely invalid URL for image load : ' + payload)
        return;
      }

      if(DEBUG) {
        console.log("ucb-vuex-datastore.js : Loading Incident Event Data from : " + payload)
      }

      // given the payload (uid), load the data for that Incident Event and store the data
      //const dataURL = "/alerts/web/jsonapi/paragraph/ucb_incident_update/" +
        //encodeURI(payload) +
        //"?include=field_ucb_incident_images,field_ucb_incident_images.field_media_image"

      axios.get(payload)
        .then(function (response) {
          let jsonData = JSON.stringify(response.data.data)
          let jsonObject = {}

          Object.assign(jsonObject, response.data)
          // save the data if we haven't already loaded this update
          if(!state.IncidentDetails.find( ({id}) => id === payload) ) {
            state.IncidentDetails.push(jsonObject)
          }else {
            if(DEBUG) {
              console.log("Not loading duplicate data for : " + payload)
            }
          }
        })
        .catch(function (error) {
          console.log("ADD_INCIDENT_EVENT_DATA (error) : " + error)
        })
    }
  },

  actions: {
    setTest: (context, payload) => {
      context.commit("SET_TEST", payload)
    },
    setError: (context, payload) => {
      context.commit("SET_ERROR", payload)
    },
    addIncidentEventId: (context, payload) => {
      context.commit("ADD_INCIDENT_EVENT_ID", payload)
    },
    addIncidentEventData: (context, payload) => {
      context.commit("ADD_INCIDENT_EVENT_DATA", payload)
    },
    addInlineImage: (context, payload) => {
      context.commit("ADD_INLINE_IMAGE", payload)
    }

  }
})
export default store;
