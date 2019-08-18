import _ from 'lodash'
import { axiosInstance as axios } from './requestInterceptor'
import { PROJECTS_API_URL } from '../config/constants'

/**
 * Get workstreams works
 *
 * @param {String} projectId project id
 * @param {String} workstreamId workstream id
 *
 * @return {Promise} resolves to workstreams works
 */
export function getWorkstreamWorks(projectId, workstreamId) {
  return axios.get(`${PROJECTS_API_URL}/v4/projects/${projectId}/workstreams/${workstreamId}/works`)
    .then(resp => _.get(resp.data, 'result.content', []))
}

/**
 * Get work info
 *
 * @param {String} projectId    project id
 * @param {String} workstreamId workstream id
 * @param {String} workId       work id
 *
 * @return {Promise} resolves to workstreams works
 */
export function getWorkInfo(projectId, workstreamId, workId ) {
  return axios.get(`${PROJECTS_API_URL}/v4/projects/${projectId}/workstreams/${workstreamId}/works/${workId}`)
    .then(resp => _.get(resp.data, 'result.content', []))
}

/**
 * Update work info
 *
 * @param {String} projectId    project id
 * @param {String} workstreamId workstream id
 * @param {String} workId       work id
 * @param {Object} updatedProps param need to update
 *
 * @return {Promise} resolves to workstreams works
 */
export function updateWorkInfo(projectId, workstreamId, workId, updatedProps ) {
  return axios.patch(`${PROJECTS_API_URL}/v4/projects/${projectId}/workstreams/${workstreamId}/works/${workId}`, { param: updatedProps })
    .then(resp => _.extend(_.get(resp.data, 'result.content', []), {workstreamId}))
}

/**
 * New work info
 *
 * @param {String} projectId    project id
 * @param {String} workstreamId workstream id
 * @param {Object} updatedProps param need to update
 *
 * @return {Promise} resolves to workstreams works
 */
export function newWorkInfo(projectId, workstreamId, updatedProps ) {
  return axios.post(`${PROJECTS_API_URL}/v4/projects/${projectId}/workstreams/${workstreamId}/works`, { param: updatedProps })
    .then(resp => _.extend(_.get(resp.data, 'result.content', []), {workstreamId}))
}

/**
 * Delete work info
 *
 * @param {String} projectId    project id
 * @param {String} workstreamId workstream id
 * @param {String} workId       work id
 *
 * @return {Promise} resolves to workstreams works
 */
export function deleteWorkInfo(projectId, workstreamId, workId ) {
  return axios.delete(`${PROJECTS_API_URL}/v4/projects/${projectId}/workstreams/${workstreamId}/works/${workId}`)
    .then(() => ({workstreamId, id: workId}))
}

/**
 * Get workitems
 *
 * @param {String} projectId project id
 * @param {String} workstreamId workstream id
 * @param {String} workId       work id
 *
 * @return {Promise} resolves to getWorkitems
 */
export function getWorkitems(projectId, workstreamId, workId) {
  return axios.get(`${PROJECTS_API_URL}/v4/projects/${projectId}/workstreams/${workstreamId}/works/${workId}/workitems`)
    .then(resp => _.get(resp.data, 'result.content', []))
}

/**
 * New workitems
 *
 * @param {String} projectId project id
 * @param {String} workstreamId workstream id
 * @param {String} workId       work id
 * @param {Object} workitem       work item
 *
 * @return {Promise} resolves to getWorkitems
 */
export function newWorkitem(projectId, workstreamId, workId, workitem) {
  return axios.post(`${PROJECTS_API_URL}/v4/projects/${projectId}/workstreams/${workstreamId}/works/${workId}/workitems`, {
    param: workitem
  })
    .then(resp => _.get(resp.data, 'result.content', {}))
}

/**
 * Delete workitems
 *
 * @param {String} projectId project id
 * @param {String} workstreamId workstream id
 * @param {String} workId       work id
 * @param {Number} workitemId       work item id
 *
 * @return {Promise} workitem id
 */
export function deleteWorkitem(projectId, workstreamId, workId, workitemId) {
  return axios.delete(`${PROJECTS_API_URL}/v4/projects/${projectId}/workstreams/${workstreamId}/works/${workId}/workitems/${workitemId}`)
    .then(() => workitemId)
    .catch(error => {
      // throw error with work item id
      error.workitemId = workitemId
      throw error
    })
}