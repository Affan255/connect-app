/**
 * Container component for MetaData
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { branch, renderComponent, compose, withProps } from 'recompose'
import {
  loadProjectsMetadata,
  sortPriceConfigs
} from '../../../actions/templates'
import PriceConfigsGridView from '../components/PriceConfigsGridView'
import spinnerWhileLoading from '../../../components/LoadingSpinner'
import CoderBot from '../../../components/CoderBot/CoderBot'
import { requiresAuthentication } from '../../../components/AuthenticatedComponent'
import CoderBroken from '../../../assets/icons/coder-broken.svg'

import './MetaDataContainer.scss'
import { hasPermission } from '../../../helpers/permissions'
import { PERMISSIONS } from '../../../config/permissions'

const withLoader = spinnerWhileLoading(props => !props.isLoading && props.priceConfigs)
const PriceConfigsGridViewWithLoader = withLoader(PriceConfigsGridView)

class PriceConfigsContainer extends React.Component {

  constructor(props) {
    super(props)
    this.state = { criteria : { sort: 'updatedAt desc' } }

    this.sortHandler = this.sortHandler.bind(this)
  }

  componentWillMount() {
    if (!this.props.priceConfigs && !this.props.isLoading) {
      this.props.loadProjectsMetadata()
    }
  }

  sortHandler(fieldName) {
    this.props.sortPriceConfigs(fieldName)
    this.setState({ criteria : { sort: fieldName } })
  }

  render() {
    const {
      priceConfigs,
      isLoading,
      currentUser,
      error,
    } = this.props
    const { criteria } = this.state
    if (!hasPermission(PERMISSIONS.ACCESS_METADATA)) {
      return (
        <section className="content content-error">
          <div className="container">
            <div className="page-error">
              <CoderBroken className="icon-coder-broken" />
              <span>You don't have permission to access Metadata Management</span>
            </div>
          </div>
        </section>
      )
    }
    return (
      <div>
        <PriceConfigsGridViewWithLoader
          currentUser={currentUser}
          isLoading={isLoading}
          totalCount={priceConfigs ? priceConfigs.length : 0}
          pageNum={1}
          pageSize={priceConfigs ? priceConfigs.length : 0}
          priceConfigs={priceConfigs}
          criteria={criteria}
          sortHandler={this.sortHandler}
          error={error}
        />
      </div>
    )
  }
}

PriceConfigsContainer.propTypes = {
  loadProjectsMetadata: PropTypes.func.isRequired,
}

const mapStateToProps = ({ templates, loadUser }) => ({
  priceConfigs: templates.priceConfigs,
  isLoading: templates.isLoading,
  error: templates.error,
  currentUser: loadUser.user,
})

const mapDispatchToProps = {
  loadProjectsMetadata,
  sortPriceConfigs,
}

const page500 = compose(
  withProps({code:500})
)
const showErrorMessageIfError = hasLoaded =>
  branch(hasLoaded, renderComponent(page500(CoderBot)), t => t)
const errorHandler = showErrorMessageIfError(props => props.error)
const PriceConfigsContainerWithErrorHandler = errorHandler(PriceConfigsContainer)
const PriceConfigsContainerWithErrorHandlerAndAuth = requiresAuthentication(PriceConfigsContainerWithErrorHandler)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PriceConfigsContainerWithErrorHandlerAndAuth))
