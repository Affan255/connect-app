import _ from 'lodash'
import {
  LOAD_WORKSTREAMS_PENDING,
  LOAD_WORKSTREAMS_SUCCESS,
  LOAD_WORKSTREAMS_FAILURE,
  CLEAR_LOADED_PROJECT,
  GET_PROJECTS_SUCCESS,
  LOAD_WORKSTREAM_WORKS_PENDING,
  LOAD_WORKSTREAM_WORKS_SUCCESS,
  LOAD_WORKSTREAM_WORKS_FAILURE,
  UPDATE_WORK_INFO_SUCCESS,
  DELETE_WORK_INFO_SUCCESS,
  NEW_WORK_INFO_SUCCESS,
} from '../../config/constants'
import update from 'react-addons-update'
import {parseErrorObj} from '../../helpers/workstreams'

const initialState = {
  isLoading: false,
  error: false,
  workstreams: [], // workstreams are pushed directly into it hence need to declare first
}

function updateWorkstream(state, workstreamId, workstreamUpdateQuery) {
  const workstreamIndex = _.findIndex(state.workstreams, { id: workstreamId })
  const updatedWorkstream = update(
    state.workstreams[workstreamIndex],
    workstreamUpdateQuery
  )

  return update(state, {
    workstreams: { $splice: [[workstreamIndex, 1, updatedWorkstream]] }
  })
}

export const workstreams = function (state=initialState, action) {

  switch (action.type) {
  case LOAD_WORKSTREAMS_PENDING:
    return Object.assign({}, state, {
      isLoading: true,
      error: false
    })

  case LOAD_WORKSTREAMS_SUCCESS:
    for (const workstream of action.payload) {
      workstream.works = []
      workstream.isLoadingWorks = false
    }
    return Object.assign({}, state, {
      isLoading: false,
      error: false,
      workstreams: action.payload,
    })

  case LOAD_WORKSTREAM_WORKS_PENDING:
    return updateWorkstream(state, action.meta.workstreamId, {
      isLoadingWorks: { $set:  true }
    })

  case LOAD_WORKSTREAM_WORKS_SUCCESS:
    return updateWorkstream(state, action.meta.workstreamId, {
      works: { $set: action.payload.works },
      isLoadingWorks: { $set:  false }
    })

  case UPDATE_WORK_INFO_SUCCESS: {
    const { workstreams } = state
    const workStreamIndex = _.findIndex(workstreams, workstream => (`${workstream.id}` === `${action.payload.workstreamId}`))
    if (workStreamIndex >= 0) {
      const workIndex = _.findIndex(workstreams[workStreamIndex].works, work => (`${work.id}` === `${action.payload.id}`))
      if (workIndex >= 0) {
        workstreams[workStreamIndex].works[workIndex] = action.payload
        return Object.assign({}, state, {
          workstreams
        })
      }
    }
    return state
  }

  case DELETE_WORK_INFO_SUCCESS: {
    const { workstreams } = state
    const workStreamIndex = _.findIndex(workstreams, workstream => (`${workstream.id}` === `${action.payload.workstreamId}`))
    if (workStreamIndex >= 0) {
      _.remove(workstreams[workStreamIndex].works, {
        id: parseInt(action.payload.id)
      })
      return Object.assign({}, state, {
        workstreams
      })
    }
    return state
  }

  case NEW_WORK_INFO_SUCCESS: {
    const { workstreams } = state
    const workStreamIndex = _.findIndex(workstreams, workstream => (`${workstream.id}` === `${action.meta.workstreamId}`))
    if (workStreamIndex >= 0) {
      workstreams[workStreamIndex].works.push(action.payload)
      return Object.assign({}, state, {
        workstreams
      })
    }
    return state
  }

  case LOAD_WORKSTREAMS_FAILURE:
  case LOAD_WORKSTREAM_WORKS_FAILURE:
    return Object.assign({}, state, {
      isLoading: false,
      error: parseErrorObj(action)
    })

  // when we clear the project we have to put dashboard state to the initial state
  // because the code relies on the initial state
  // for example spinnerWhileLoading in ProjectDerail.jsx expects `isLoading` to be true
  // to prevent components which require dashboard data from rendering
  case CLEAR_LOADED_PROJECT:
  case GET_PROJECTS_SUCCESS:
    return Object.assign({}, state, initialState)

  default:
    return state
  }
}
