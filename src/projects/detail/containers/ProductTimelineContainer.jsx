/**
 * Product Timeline Container
 *
 * Currently it only shows the loader when timeline is being loaded
 * and passes some props from the store.
 * Initially this container was also loaded timelines,
 * but loading was moved to projectDashboard actions,
 * as timelines data is also needed outside of timeline container.
 *
 * So now this container becomes quite trivial and may be abolished if needed.
 */
import React from 'react'
import PT from 'prop-types'
import _ from 'lodash'
import { connect } from 'react-redux'

import Timeline from '../components/timeline/Timeline'

import {
  updateProductMilestone,
  completeProductMilestone,
  completeFinalFixesMilestone,
  extendProductMilestone,
  submitFinalFixesRequest,
} from '../../actions/productsTimelines'

import {
  ROLE_CONNECT_COPILOT,
  ROLE_CONNECT_MANAGER,
  ROLE_CONNECT_ADMIN,
  ROLE_ADMINISTRATOR,
} from '../../../config/constants'

class ProductTimelineContainer extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      // show loader for the whole timeline even if updating only one milestone
      // here is why https://github.com/appirio-tech/connect-app/issues/2291#issuecomment-410968047

      // https://github.com/appirio-tech/connect-app/issues/2422
      // Simply return Timeline component here.
      // Move out loading indicator to Timeline so the height can be maintained in there.
      <Timeline {...this.props} />
    )
  }
}

ProductTimelineContainer.propTypes = {
  currentUser: PT.shape({
    userId: PT.number.isRequired,
    isCopilot: PT.bool.isRequired,
    isManager: PT.bool.isRequired,
    isAdmin: PT.bool.isRequired,
    isCustomer: PT.bool.isRequired,
  }).isRequired,
  isLoading: PT.bool,
  timeline: PT.object,
  updateProductMilestone: PT.func.isRequired,
  completeProductMilestone: PT.func.isRequired,
  extendProductMilestone: PT.func.isRequired,
}

const mapStateToProps = ({ productsTimelines, loadUser }, props) => {
  const adminRoles = [
    ROLE_ADMINISTRATOR,
    ROLE_CONNECT_ADMIN,
  ]

  const powerUserRoles = [
    ROLE_CONNECT_COPILOT,
    ROLE_CONNECT_MANAGER,
    ROLE_ADMINISTRATOR,
    ROLE_CONNECT_ADMIN,
  ]

  return {
    timeline: _.get(productsTimelines[props.product.id], 'timeline'),
    isLoading: _.get(productsTimelines[props.product.id], 'isLoading', false),
    phaseId: props.product.phaseId,
    currentUser: {
      userId: parseInt(loadUser.user.id, 10),
      isCopilot: _.includes(loadUser.user.roles, ROLE_CONNECT_COPILOT),
      isManager: _.includes(loadUser.user.roles, ROLE_CONNECT_MANAGER),
      isAdmin: _.intersection(loadUser.user.roles, adminRoles).length > 0,
      isCustomer:  _.intersection(loadUser.user.roles, powerUserRoles).length === 0,
    },
  }
}

const mapDispatchToProps = {
  updateProductMilestone,
  completeProductMilestone,
  completeFinalFixesMilestone,
  extendProductMilestone,
  submitFinalFixesRequest,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductTimelineContainer)
