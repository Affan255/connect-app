import React, { Component } from 'react'
import PT from 'prop-types'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import moment from 'moment'
import DeleteProjectModal from './DeleteProjectModal'
import ProjectCardBody from '../../projects/components/projectsCard/ProjectCardBody'
import MobileExpandable from '../MobileExpandable/MobileExpandable'
import MediaQuery from 'react-responsive'
import { SCREEN_BREAKPOINT_MD, PROJECT_STATUS_ACTIVE, PHASE_STATUS_ACTIVE, PHASE_STATUS_REVIEWED, PROJECT_ROLE_OWNER, PROJECT_ROLE_CUSTOMER } from '../../config/constants'
import ReviewProjectButton from '../../projects/detail/components/ReviewProjectButton'
import Tooltip from 'appirio-tech-react-components/components/Tooltip/Tooltip'
import { TOOLTIP_DEFAULT_DELAY } from '../../config/constants'
import { getProjectTemplateByKey } from '../../helpers/templates'

import ProjectTypeIcon from '../../components/ProjectTypeIcon'
import './ProjectInfo.scss'

class ProjectInfo extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { project, currentMemberRole,
      onChangeStatus, isSuperUser, phases, onSubmitForReview, isProjectProcessing,
      showDeleteConfirm, toggleProjectDelete, onConfirmDelete, projectTemplates } = this.props

    const code = _.get(project, 'details.utm.code', '')

    const hasReviewedOrActivePhases = !!_.find(phases, (phase) => _.includes([PHASE_STATUS_REVIEWED, PHASE_STATUS_ACTIVE], phase.status))
    const isProjectActive = project.status === PROJECT_STATUS_ACTIVE
    const isV3Project = project.version === 'v3'
    const projectCanBeActive =  !isV3Project || (!isProjectActive && hasReviewedOrActivePhases) || isProjectActive


    // prepare review button
    const showReviewBtn = project.status === 'draft' &&
      _.indexOf([PROJECT_ROLE_OWNER, PROJECT_ROLE_CUSTOMER], currentMemberRole) > -1

    const reviewButtonSection = (
      <div className="project-info-review">
        <p>
          Your project "{_.unescape(project.name)}" has been drafted.
          If you have your requirements documented, just verify it against our checklist and then upload it on the <Link to={`/projects/${project.id}/scope`}>Scope</Link> section.
          Once you've finalized your scope, select the "Submit for Review" button.
          Topcoder will then review your drafted project and will assign a manager to get your delivery in-progress!
          Get stuck or need help? Email us at <a href="mailto:support@topcoder.com">support@topcoder.com</a>.
        </p>
        <ReviewProjectButton project={project} onClick={onSubmitForReview} disabled={isProjectProcessing} wrapperClass="no-bg" />
      </div>
    )

    const url = `/projects/${project.id}`
    const projectTemplateId = project.templateId
    const projectTemplateKey = _.get(project, 'details.products[0]')
    const projectTemplate = projectTemplateId
      ? _.find(projectTemplates, pt => pt.id === projectTemplateId)
      : getProjectTemplateByKey(projectTemplates, projectTemplateKey)
    // icon for the product, use default generic work project icon for categories which no longer exist now
    const productIcon = _.get(projectTemplate, 'icon', 'tech-32px-outline-work-project')
    const templateName = _.get(projectTemplate, 'name', null)
    const projectType = project.type !== undefined ? project.type[0].toUpperCase() + project.type.substr(1).replace(/_/g, ' ') : null
    return (
      <div className="project-info">
        <div className="icon-and-status" >
          <div className="item-icon">
            <Link to={url} className="spacing">
              <div className="project-type-icon" title={templateName ? templateName : projectType}>
                <ProjectTypeIcon type={productIcon} />
              </div>
            </Link>
          </div>
          <div className="project-status">
            <div styleName="project-name">{_.unescape(project.name)}</div>
          </div>
        </div>
        <div styleName="project-status-bottom">
          <div className="project-status-time">
            Created {moment(project.createdAt).format('MMM DD, YYYY')}
          </div>
          {!!code &&
          <div styleName="tooltip-target-container">
            <Tooltip styleName="tooltip" theme="light" tooltipDelay={TOOLTIP_DEFAULT_DELAY}>
              <div className="tooltip-target">
                <div className="project-status-ref">{_.unescape(code)}</div>
              </div>
              <div className="tooltip-body">
                <div>{_.unescape(code)}</div>
              </div>
            </Tooltip>
          </div>

          }
        </div>
        {showDeleteConfirm && (
          <DeleteProjectModal
            onCancel={toggleProjectDelete}
            onConfirm={onConfirmDelete}
          />
        )}
        {showReviewBtn ? (
          reviewButtonSection
        ) : (
          <MobileExpandable title="DESCRIPTION" defaultOpen>
            <MediaQuery minWidth={SCREEN_BREAKPOINT_MD}>
              {matches => (
                <ProjectCardBody
                  project={project}
                  projectCanBeActive={projectCanBeActive}
                  currentMemberRole={currentMemberRole}
                  descLinesCount={
                    /* has to be not too big value here,
                      because the plugin will make this number of iterations
                      see https://github.com/ShinyChang/React-Text-Truncate/blob/master/src/TextTruncate.js#L133
                      too big value may cause browser tab to freeze
                    */
                    matches ? 4 : 1000
                  }
                  onChangeStatus={onChangeStatus}
                  isSuperUser={isSuperUser}
                  showLink
                  hideStatus
                />
              )}
            </MediaQuery>
          </MobileExpandable>
        )}
      </div>
    )
  }
}

ProjectInfo.propTypes = {
  project: PT.object.isRequired,
  currentMemberRole: PT.string,
  productsTimelines: PT.object.isRequired,
  updateProject: PT.func,
  isProjectProcessing: PT.bool,
}

export default ProjectInfo
