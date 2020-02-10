Vue.use(Vuex)
const DEBUG = false

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
      return state.IncidentDetails.length
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
    ADD_INCIDENT_EVENT_IDS : (state, payload) => {
      let found = false
      let updateID = Object.keys(payload)

      // we need to loop through our data structure to see if we've already
      // loaded this information
      for(let i = 0; i < state.IncidentEventIDs.length; i++) {
        Object.keys(state.IncidentEventIDs[i]).forEach(function (key) {
          if(key === updateID[0]) {
            // we've already loaded this information before so  now ...
            found = true
            // ... remove ...
            state.IncidentEventIDs.splice(i, 1)
            //and replace with the newest loaded data
            state.IncidentEventIDs.push(payload)
          }
        })
      }

      if(!found) {
        state.IncidentEventIDs.push(payload)
      }
    },
    ADD_INLINE_IMAGE : (state, payload) => {
      let found = false;

      // lets loop through all of the loaded data to see if we've already loaded this content before
      for(let i = 0; i < state.InlineImages.length; i++) {
        if(payload.data.id === state.InlineImages[i].data.id)  {
          state.InlineImages.splice(i, 1, payload)
          found = true;
        }
      }
      if(!found) {
        // new data... so add it to the array
        state.InlineImages.push(payload)
      }
    },
    ADD_INCIDENT_EVENT_DATA : (state, payload) => {
      let found = false;

      // lets loop through all of the loaded data to see if we've already loaded this content before
      for(let i = 0; i < state.IncidentDetails.length; i++) {
        // console.log("Comparing if : " + payload + 'is the same as : ' + state.IncidentDetails[i].links.self.href);
        if(payload.data.id === state.IncidentDetails[i].data.id)  {
          state.IncidentDetails.splice(i, 1, payload)
          found = true;
        }
      }
      if(!found) {
        // new data... so add it to the array
        state.IncidentDetails.push(payload)
      }
    }
  },
  actions: {
    setTest: (context, payload) => {
      context.commit("SET_TEST", payload)
    },
    setError: (context, payload) => {
      context.commit("SET_ERROR", payload)
    },
    addIncidentEventIds: (context, payload) => {
      context.commit("ADD_INCIDENT_EVENT_IDS", payload)
    },
    addIncidentEventData: (context, payload) => {
      if(!payload.includes('/jsonapi/paragraph/ucb_incident_update')) {
        console.log('ucb-vuex-datastore.js : Likely invalid URL for image load : ' + payload)
        return;
      }

      if(DEBUG) {
        console.log("ucb-vuex-datastore.js : Loading Incident Event Data from : " + payload)
      }

      axios.get(payload)
        .then(function (response) {
          // let jsonData = JSON.stringify(response.data.data)
          let jsonObject = {}

          Object.assign(jsonObject, response.data)

          if(jsonObject) {
            context.commit("ADD_INCIDENT_EVENT_DATA", jsonObject)
          }
        })
        .catch(function (error) {
          console.log("ADD_INCIDENT_EVENT_DATA (error) : " + error)
        })
    },
    addInlineImage: (context, payload) => {
      if(!payload.includes('/jsonapi/media/image/')) {
        console.log('ucb-vuex-datastore.js : Likely invalid URL for image load : ' + payload)
        return;
      }

      if(DEBUG) {
        console.log("ucb-vuex-datastore.js : Loading Incident inline image from : " + payload)
      }

      axios.get(payload)
        .then(function (response) {
          // let jsonData = JSON.stringify(response.data.data)
          let jsonObject = {}

          Object.assign(jsonObject, response.data)

          if(jsonObject) {
            context.commit("ADD_INLINE_IMAGE", jsonObject)
          }
        })
        .catch(function (error) {
          console.log("ADD_INLINE_IMAGE (error) : " + error)
        })
    }

  }
})
export default store;
