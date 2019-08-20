import _ from 'lodash'
import Alert from 'react-s-alert'
import { isJson } from '../helpers/workstreams'

/* eslint-disable no-unused-vars */
import {
  // Project
  CREATE_PROJECT_STAGE_SUCCESS,
  CREATE_PROJECT_SUCCESS, CREATE_PROJECT_FAILURE,
  UPDATE_PROJECT_SUCCESS, UPDATE_PROJECT_FAILURE,
  DELETE_PROJECT_SUCCESS, DELETE_PROJECT_FAILURE,
  LOAD_PROJECT_SUCCESS,
  // Attachments
  ADD_PROJECT_ATTACHMENT_SUCCESS, ADD_PROJECT_ATTACHMENT_FAILURE,
  UPDATE_PROJECT_ATTACHMENT_SUCCESS, UPDATE_PROJECT_ATTACHMENT_FAILURE,
  REMOVE_PROJECT_ATTACHMENT_SUCCESS, REMOVE_PROJECT_ATTACHMENT_FAILURE,
  // project Members
  ADD_PROJECT_MEMBER_SUCCESS, ADD_PROJECT_MEMBER_FAILURE,
  UPDATE_PROJECT_MEMBER_SUCCESS, UPDATE_PROJECT_MEMBER_FAILURE,
  REMOVE_PROJECT_MEMBER_SUCCESS, REMOVE_PROJECT_MEMBER_FAILURE,
  // invite topcoder Team
  INVITE_TOPCODER_MEMBER_FAILURE, INVITE_TOPCODER_MEMBER_SUCCESS,
  REMOVE_TOPCODER_MEMBER_INVITE_FAILURE, REMOVE_TOPCODER_MEMBER_INVITE_SUCCESS,
  // invite customer
  INVITE_CUSTOMER_FAILURE, INVITE_CUSTOMER_SUCCESS,
  REMOVE_CUSTOMER_INVITE_FAILURE, REMOVE_CUSTOMER_INVITE_SUCCESS,
  // accepted or refused invite
  ACCEPT_OR_REFUSE_INVITE_SUCCESS, ACCEPT_OR_REFUSE_INVITE_FAILURE,
  PROJECT_MEMBER_INVITE_STATUS_ACCEPTED, PROJECT_MEMBER_INVITE_STATUS_REFUSED,
  PROJECT_MEMBER_INVITE_STATUS_REQUEST_APPROVED, PROJECT_MEMBER_INVITE_STATUS_REQUEST_REJECTED,
  // project feeds
  CREATE_PROJECT_FEED_FAILURE,
  CREATE_PROJECT_FEED_COMMENT_FAILURE,
  SAVE_PROJECT_FEED_FAILURE,
  SAVE_PROJECT_FEED_COMMENT_FAILURE,
  DELETE_PROJECT_FEED_FAILURE,
  DELETE_PROJECT_FEED_COMMENT_FAILURE,
  GET_PROJECT_FEED_COMMENT_FAILURE,
  // Project status
  PROJECT_STATUS_IN_REVIEW,
  // phase comments
  CREATE_TOPIC_POST_FAILURE,
  UPDATE_TOPIC_POST_FAILURE,
  DELETE_TOPIC_POST_FAILURE,
  // products
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PHASE_FAILURE,
  DELETE_PROJECT_PHASE_SUCCESS,
  // timelines
  UPDATE_PRODUCT_TIMELINE_FAILURE,
  LOAD_PRODUCT_TIMELINE_WITH_MILESTONES_FAILURE,
  // milestones
  UPDATE_PRODUCT_MILESTONE_FAILURE,
  COMPLETE_PRODUCT_MILESTONE_FAILURE,
  COMPLETE_PRODUCT_MILESTONE_SUCCESS,
  EXTEND_PRODUCT_MILESTONE_FAILURE,
  EXTEND_PRODUCT_MILESTONE_SUCCESS,
  SUBMIT_FINAL_FIXES_REQUEST_FAILURE,
  SUBMIT_FINAL_FIXES_REQUEST_SUCCESS,
  // Work
  UPDATE_WORK_INFO_SUCCESS,
  UPDATE_WORK_INFO_FAILURE,
  DELETE_WORK_INFO_SUCCESS,
  DELETE_WORK_INFO_FAILURE,
  NEW_WORK_INFO_SUCCESS,
  NEW_WORK_INFO_FAILURE,
  // Work Timeline
  NEW_WORK_TIMELINE_MILESTONE_SUCCESS,
  NEW_WORK_TIMELINE_MILESTONE_FAILURE,
  UPDATE_WORK_TIMELINE_MILESTONE_SUCCESS,
  UPDATE_WORK_TIMELINE_MILESTONE_FAILURE,
  DELETE_WORK_TIMELINE_MILESTONE_SUCCESS,
  DELETE_WORK_TIMELINE_MILESTONE_FAILURE,
  // work item
  NEW_WORK_ITEM_SUCCESS,
  NEW_WORK_ITEM_FAILURE,
  DELETE_WORK_ITEM_SUCCESS,
  DELETE_WORK_ITEM_FAILURE,
  // Scope changes
  CREATE_SCOPE_CHANGE_REQUEST_SUCCESS,
  CREATE_SCOPE_CHANGE_REQUEST_FAILURE,
  APPROVE_SCOPE_CHANGE_SUCCESS,
  REJECT_SCOPE_CHANGE_SUCCESS,
  CANCEL_SCOPE_CHANGE_SUCCESS,
  ACTIVATE_SCOPE_CHANGE_SUCCESS,
  APPROVE_SCOPE_CHANGE_FAILURE,
  REJECT_SCOPE_CHANGE_FAILURE,
  CANCEL_SCOPE_CHANGE_FAILURE,
  ACTIVATE_SCOPE_CHANGE_FAILURE
} from '../config/constants'
/* eslint-enable no-unused-vars */

/**
 * Get error message
 * @param {Object} action request action
 * @param {Bool} returnFullStringIfNoMessageFound return full response from server if no message found
 *
 * @return {String} meaningful error message
 */
function getErrorMessage(action, returnFullStringIfNoMessageFound = false) {
  if (action.payload && action.payload.response) {
    const rdata = action.payload.response.data
    if (rdata && rdata.result && rdata.result.content && rdata.result.content.message) {
      return rdata.result.content.message
    }
    if (action.payload.response.statusText) {
      return action.payload.response.statusText
    }
  }

  if (returnFullStringIfNoMessageFound && action.payload) {
    let errorObject = (action.payload && action.payload.response) ? action.payload.response : action.payload
    if (action.payload && action.payload.response) {
      errorObject = action.payload.response
    } else if (action.payload && action.payload.message) {
      errorObject = action.payload.message
    } else {
      errorObject = action.payload
    }
    if (isJson(errorObject)) {
      JSON.parse(errorObject)
    } else if (errorObject) {
      return errorObject
    }
  }

  return null
}

export default function(state = {}, action) {
  switch(action.type) {
  case CREATE_PROJECT_SUCCESS: {
    const name = _.truncate(action.payload.name, 20)

    //temporary workaround
    setTimeout(() => { Alert.success(`Project '${name}' created`) }, 0)

    return state
  }

  case CREATE_PROJECT_STAGE_SUCCESS: {
    const name = _.truncate(action.payload.name, 20)

    //delay time for reload stage list of project after creating state
    setTimeout(() => { Alert.success(`Added New Stage To Project '${name}'`) }, 2000)

    return state
  }

  case DELETE_PROJECT_PHASE_SUCCESS: {
    Alert.success('Project phase deleted.')

    return state
  }

  case DELETE_PROJECT_SUCCESS:
    Alert.success('Project deleted.')
    return state

  case COMPLETE_PRODUCT_MILESTONE_SUCCESS:
    Alert.success('Milestone is completed.')
    return state

  case EXTEND_PRODUCT_MILESTONE_SUCCESS:
    Alert.success('Milestone is extended.')
    return state

  case SUBMIT_FINAL_FIXES_REQUEST_SUCCESS:
    Alert.success('Final fixes are submitted.')
    return state

  case LOAD_PROJECT_SUCCESS:
    return Object.assign({}, state, {
      project: action.payload
    })

  case UPDATE_PROJECT_SUCCESS: {
    const prevStatus = _.get(state, 'project.status', '')
    if (action.payload.status === PROJECT_STATUS_IN_REVIEW
      && prevStatus && prevStatus !== PROJECT_STATUS_IN_REVIEW) {
      Alert.success('Project submitted.')
    } else {
      Alert.success('Project updated.')
    }
    return Object.assign({}, state, {
      project: action.payload
    })
  }

  case CREATE_SCOPE_CHANGE_REQUEST_SUCCESS:
    Alert.success('Submitted the Change Request successfully')
    return state

  case CREATE_SCOPE_CHANGE_REQUEST_FAILURE:
    Alert.error('Unable to submit the Change Request')
    return state

  case APPROVE_SCOPE_CHANGE_SUCCESS:
    Alert.success('Approved the Scope Change successfully')
    return state

  case APPROVE_SCOPE_CHANGE_FAILURE:
    Alert.error('Unable to Approve the Scope Change')
    return state

  case REJECT_SCOPE_CHANGE_SUCCESS:
    Alert.success('Rejected the Scope Change successfully')
    return state

  case REJECT_SCOPE_CHANGE_FAILURE:
    Alert.error('Unable to Reject the Scope Change')
    return state

  case CANCEL_SCOPE_CHANGE_SUCCESS:
    Alert.success('Canceled the Scope Change successfully')
    return state

  case CANCEL_SCOPE_CHANGE_FAILURE:
    Alert.error('Unable to Cancel the Scope Change')
    return state

  case ACTIVATE_SCOPE_CHANGE_SUCCESS:
    Alert.success('Activated the Scope Change successfully')
    return state

  case ACTIVATE_SCOPE_CHANGE_FAILURE:
    Alert.error('Unable to Activate the Scope Change')
    return state

  case UPDATE_PRODUCT_SUCCESS:
    Alert.success('Product updated')
    return state

  case REMOVE_PROJECT_MEMBER_SUCCESS:
    // show notification message if user leaving a project
    if (action.meta.isUserLeaving) {
      Alert.success('You\'ve successfully left the project.')
    }
    return state

  case ADD_PROJECT_ATTACHMENT_SUCCESS:
    Alert.success('Added attachment to the project successfully')
    return state

  case UPDATE_PROJECT_ATTACHMENT_SUCCESS:
    Alert.success('Updated attachment succcessfully')
    return state
  case REMOVE_PROJECT_ATTACHMENT_SUCCESS:
    Alert.success('Removed attachment successfully')
    return state

  case INVITE_TOPCODER_MEMBER_SUCCESS:
  case INVITE_CUSTOMER_SUCCESS:
    if(action.payload.success.length && !action.payload.failed) {
      Alert.success('You\'ve successfully invited member(s).')
    } else if (action.payload.success.length && action.payload.failed) {
      Alert.warning('Some members couldn\'t be invited.')
    } else if (!action.payload.success.length && action.payload.failed) {
      Alert.error('You are unable to invite members successfully.')
    }
    return state

  case REMOVE_TOPCODER_MEMBER_INVITE_SUCCESS:
  case REMOVE_CUSTOMER_INVITE_SUCCESS:
    Alert.success('You have successfully remove member invitation.')
    return state

  case REMOVE_TOPCODER_MEMBER_INVITE_FAILURE:
  case REMOVE_CUSTOMER_INVITE_FAILURE:
    Alert.error('You are unable to remove member invitations.')
    return state

  case INVITE_TOPCODER_MEMBER_FAILURE:
  case INVITE_CUSTOMER_FAILURE:
    Alert.error('You are unable to invite members successfully.')
    return state

  case ACCEPT_OR_REFUSE_INVITE_SUCCESS:
    if (action.payload.status===PROJECT_MEMBER_INVITE_STATUS_ACCEPTED){
      Alert.success('You\'ve successfully joined the project.')
    } else if (action.payload.status===PROJECT_MEMBER_INVITE_STATUS_REFUSED){
      Alert.success('You\'ve refused to join the project.')
    } else if (action.payload.status===PROJECT_MEMBER_INVITE_STATUS_REQUEST_APPROVED){
      Alert.success('You\'ve approved copilot invitation request.')
    } else if (action.payload.status===PROJECT_MEMBER_INVITE_STATUS_REQUEST_REJECTED){
      Alert.success('You\'ve rejected copilot invitation request.')
    }
    return state

  // work
  case UPDATE_WORK_INFO_SUCCESS:
    Alert.success('Work is updated')
    return state
  case UPDATE_WORK_INFO_FAILURE: {
    const errorMessage = getErrorMessage(action)
    if (errorMessage) {
      Alert.error(`Work updating failed: ${errorMessage}`)
    } else {
      Alert.error('Work updating failed: we ran into a problem.<br/> Please try again later.')
    }
    return state
  }
  // work delete
  case DELETE_WORK_INFO_SUCCESS:
    Alert.success('Work is deleted')
    return state
  case DELETE_WORK_INFO_FAILURE: {
    const errorMessage = getErrorMessage(action)
    if (errorMessage) {
      Alert.error(`Work deleting failed: ${errorMessage}`)
    } else {
      Alert.error('Work deleting failed: we ran into a problem.<br/> Please try again later.')
    }
    return state
  }
  // new work
  case NEW_WORK_INFO_SUCCESS:
    Alert.success('Work is created')
    return state
  case NEW_WORK_INFO_FAILURE: {
    const errorMessage = getErrorMessage(action)
    if (errorMessage) {
      Alert.error(`Work creating failed: ${errorMessage}`)
    } else {
      Alert.error('Work creating failed: we ran into a problem.<br/> Please try again later.')
    }
    return state
  }
  // new work timeline
  case NEW_WORK_TIMELINE_MILESTONE_SUCCESS:
    Alert.success('Milestone is created')
    return state
  case NEW_WORK_TIMELINE_MILESTONE_FAILURE: {
    Alert.error(`Milestone creating failed: ${getErrorMessage(action, true)}`)
    return state
  }
  // update work timeline
  case UPDATE_WORK_TIMELINE_MILESTONE_SUCCESS:
    Alert.success('Milestone is updated')
    return state
  case UPDATE_WORK_TIMELINE_MILESTONE_FAILURE: {
    Alert.error(`Milestone updating failed: ${getErrorMessage(action, true)}`)
    return state
  }
  // delete work timeline
  case DELETE_WORK_TIMELINE_MILESTONE_SUCCESS:
    Alert.success('Milestone is deleted')
    return state
  case DELETE_WORK_TIMELINE_MILESTONE_FAILURE: {
    Alert.error(`Milestone deleting failed: ${getErrorMessage(action, true)}`)
    return state
  }

  // new work item
  case NEW_WORK_ITEM_SUCCESS:
    Alert.success('Work item is created')
    return state
  case NEW_WORK_ITEM_FAILURE: {
    const errorMessage = getErrorMessage(action, true)
    Alert.error(`Work item creating failed: ${errorMessage}`)
    return state
  }
  // delete work item
  case DELETE_WORK_ITEM_SUCCESS:
    Alert.success('Work item is deleted')
    return state
  case DELETE_WORK_ITEM_FAILURE: {
    const errorMessage = getErrorMessage(action, true)
    Alert.error(`Work item deleting failed: ${errorMessage}`)
    return state
  }

  case UPDATE_PROJECT_FAILURE: {
    const data = _.get(action.payload, 'response.data.result')
    let message = _.get(data, 'content.message', 'Unable to update project')
    message = _.get(data, 'details', message)
    Alert.error(message)
    return state
  }

  case CREATE_PROJECT_FAILURE:
  case DELETE_PROJECT_FAILURE:
  case ADD_PROJECT_ATTACHMENT_FAILURE:
  case UPDATE_PROJECT_ATTACHMENT_FAILURE:
  case REMOVE_PROJECT_ATTACHMENT_FAILURE:
  case ADD_PROJECT_MEMBER_FAILURE:
  case UPDATE_PROJECT_MEMBER_FAILURE:
  case REMOVE_PROJECT_MEMBER_FAILURE:
  case CREATE_PROJECT_FEED_COMMENT_FAILURE:
  case SAVE_PROJECT_FEED_COMMENT_FAILURE:
  case DELETE_PROJECT_FEED_COMMENT_FAILURE:
  case GET_PROJECT_FEED_COMMENT_FAILURE:
  case CREATE_PROJECT_FEED_FAILURE:
  case SAVE_PROJECT_FEED_FAILURE:
  case DELETE_PROJECT_FEED_FAILURE:
  case CREATE_TOPIC_POST_FAILURE:
  case UPDATE_TOPIC_POST_FAILURE:
  case DELETE_TOPIC_POST_FAILURE:
  case UPDATE_PHASE_FAILURE:
  case LOAD_PRODUCT_TIMELINE_WITH_MILESTONES_FAILURE:
  case UPDATE_PRODUCT_TIMELINE_FAILURE:
  case UPDATE_PRODUCT_MILESTONE_FAILURE:
  case COMPLETE_PRODUCT_MILESTONE_FAILURE:
  case EXTEND_PRODUCT_MILESTONE_FAILURE:
  case SUBMIT_FINAL_FIXES_REQUEST_FAILURE:
  case ACCEPT_OR_REFUSE_INVITE_FAILURE: {
    const errorMessage = getErrorMessage(action)
    if (errorMessage) {
      Alert.error(errorMessage)
    } else {
      Alert.error('Whoops! we ran into a problem.<br/> Please try again later.')
    }
    return state
  }
  default:
    return state
  }
}
