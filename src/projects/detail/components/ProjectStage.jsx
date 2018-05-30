/**
 * Project stage
 */
import React from 'react'
import PT from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import uncontrollable from 'uncontrollable'

import { formatNumberWithCommas } from '../../../helpers/format'

import PhaseCard from './PhaseCard'
import GenericMenu from '../../../components/GenericMenu'
import EditProjectForm from './EditProjectForm'
import spinnerWhileLoading from '../../../components/LoadingSpinner'

const enhance = spinnerWhileLoading(props => !props.processing)
const EnhancedEditProjectForm = enhance(EditProjectForm)

/**
 * Format PhaseCard attr property
 *
 * @param {Object} phase            phase
 * @param {Array}  productTemplates product templates
 *
 * @returns {Object} PhaseCard attr property
 */
function formatPhaseCardAttr(phase, productTemplates) {
  // NOTE so far one phase always has 1 product
  // but as in the future this may be changed, we work with products as an array
  const product = _.get(phase, 'products[0]')
  const { status } = phase
  const productTemplate = _.find(productTemplates, { id: product.templateId })
  const budget = product.budget || 0
  const price = `$${formatNumberWithCommas(budget)}`
  const icon = _.get(productTemplate, 'icon')
  const title = _.get(productTemplate, 'name')
  const startDate = phase.startDate && moment(phase.startDate)
  const endDate = phase.endDate && moment(phase.endDate)
  const duration = startDate && endDate
    ? moment.duration(endDate.diff(startDate)).days() + ' days'
    : '0 days'
  let startEndDates = startDate ? `${startDate.format('MMM D')}` : ''
  startEndDates += startDate && endDate ? `–${endDate.format('MMM D')}` : ''

  const actualPrice = product.actualPrice
  let paidStatus = 'Quoted'
  if (actualPrice && actualPrice === budget) {
    paidStatus = 'Paid in full'
  } else if (actualPrice && actualPrice < budget) {
    paidStatus = `$${formatNumberWithCommas(budget - actualPrice)} remaining`
  }

  return {
    icon,
    title,
    duration,
    startEndDates,
    price,
    paidStatus,
    status,
  }
}

const ProjectStage = ({
  activeTab,
  phase,
  project,
  productTemplates,
  currentMemberRole,
  isProcessing,
  isSuperUser,
  updateProduct,
  fireProjectDirty,
  fireProjectDirtyUndo,
  onTabClick,
}) => {
  const tabs = [
    {
      onClick: () => onTabClick('timeline'),
      label: 'Timeline',
      isActive: activeTab === 'timeline'
    }, {
      onClick: () => onTabClick('posts'),
      label: 'Posts',
      isActive: activeTab === 'posts'
    }, {
      onClick: () => onTabClick('specification'),
      label: 'Specification',
      isActive: activeTab === 'specification'
    }
  ]

  // NOTE even though in store we keep products as an array,
  // so far we always have only one product per phase, so will display only one
  const productTemplate = _.find(productTemplates, { id: _.get(phase, 'products[0].templateId') })
  const product = _.get(phase, 'products[0]')
  const sections = _.get(productTemplate, 'template.questions', [])

  return (
    <PhaseCard attr={formatPhaseCardAttr(phase, productTemplates)}>
      <div>
        <GenericMenu navLinks={tabs} />

        {activeTab === 'timeline' &&
          <div>Timeline</div>
        }

        {activeTab === 'posts' &&
          <div>Posts</div>
        }

        {activeTab === 'specification' &&
          <div className="two-col-content content">
            <EnhancedEditProjectForm
              project={product}
              sections={sections}
              isEdittable={isSuperUser || !!currentMemberRole}
              submitHandler={(model) => updateProduct(project.id, phase.id, product.id, model)}
              saving={isProcessing}
              fireProjectDirty={(values) => fireProjectDirty(phase.id, product.id, values)}
              fireProjectDirtyUndo= {fireProjectDirtyUndo}
            />
          </div>
        }
      </div>
    </PhaseCard>
  )
}

ProjectStage.defaultProps = {
  activeTab: 'timeline',
  currentMemberRole: null,
}

ProjectStage.propTypes = {
  activeTab: PT.string,
  onTabClick: PT.func.isRequired,
  project: PT.object.isRequired,
  currentMemberRole: PT.string,
  isProcessing: PT.bool.isRequired,
  isSuperUser: PT.bool.isRequired,
  updateProduct: PT.func.isRequired,
  fireProjectDirty: PT.func.isRequired,
  fireProjectDirtyUndo: PT.func.isRequired,
}

export default uncontrollable(ProjectStage, {
  activeTab: 'onTabClick',
})
