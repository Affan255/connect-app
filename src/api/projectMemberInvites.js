import { axiosInstance as axios } from './requestInterceptor'
import { PROJECTS_API_URL } from '../config/constants'

/**
 * Update project member invite based on project's id & given member
 * @param  {integer} projectId unique identifier of the project
 * @param  {object}  member invite to update
 * @return {object}  project member invite returned by api
 */
export function updateProjectMemberInvite(projectId, member) {
  const url = `${PROJECTS_API_URL}/v4/projects/${projectId}/members/invite/`
  return axios.put(url, { param: member})
    .then(resp => {
      return resp.data.result.content
    })
}

/**
 * Create a project member invite based on project's id & given member
 * @param  {integer} projectId unique identifier of the project
 * @param  {object}  member invite
 * @return {object}  project member invite returned by api
 */
export function createProjectMemberInvite(projectId, member) {
  const fields = 'id,projectId,userId,email,role,status,createdAt,updatedAt,createdBy,updatedBy,handle,firstName,lastName,photoURL'
  const url = `${PROJECTS_API_URL}/v4/projects/${projectId}/members/invite/?fields=` + encodeURIComponent(fields)
  return axios({
    method: 'post',
    url,
    data: {
      param: member
    },
    validateStatus (status) {
      return (status >= 200 && status < 300) || status === 403
    },
  })
    .then(resp => {
      return resp.data.result.content
    })
}

/**
 * Get a project member invite based on project's id
 * @param  {integer} projectId unique identifier of the project
 * @return {object}  project member invite returned by api
 */
export function getProjectInviteById(projectId) {
  return axios.get(`${PROJECTS_API_URL}/v4/projects/${projectId}/members/invite/`)
    .then(resp => {
      return resp.data.result.content
    })
}
