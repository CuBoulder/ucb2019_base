Vue.use(Vuex)
const DEBUG = true

const store = new Vuex.Store({
  state: {
    test: 'Testing 1... 2... 3... ',
    errorMsg: '',
    IncidentDetails: [],
    IncidentEventIDs: [],
    InlineImages: [],
    loaded: false
  },

  getters: {
    getTest: state => {
      return state.test
    },
    getLoaded: state => {
      return state.loaded
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
      const dataURL = "/alerts/web/jsonapi/media/image/" + encodeURI(payload) +
        "?include=field_media_image"

      if(DEBUG) {
        console.log("Loading data from : " + dataURL)
      }

      axios.get(dataURL)
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
            // maybe check the timestamp to see if we need to update this one?
          }
        })
        .catch(function (error) {
          console.log("ADD_INLINE_IMAGE (error) : " + error)
        })
        .finally(function () {
          state.loaded = true
        })
    },
    ADD_INCIDENT_EVENT_DATA : (state, payload) => {
      // given the payload (uid), load the data for that Incident Event and store the data
      const dataURL = "/alerts/web/jsonapi/paragraph/ucb_incident_update/" +
        encodeURI(payload) +
        "?include=field_ucb_incident_images,field_ucb_incident_images.field_media_image"

      if(DEBUG) {
        console.log("Loading data from : " + dataURL)
      }

      axios.get(dataURL)
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
            // maybe check the timestamp to see if we need to update this one?
          }
        })
        .catch(function (error) {
          console.log("ADD_INCIDENT_EVENT_DATA (error) : " + error)
        })
        .finally(function () {
          state.loaded = true
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
