/**
 * EditProjectFrom component
 * shows forms to edit some set of project specification sections
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router-dom'
import Modal from 'react-modal'
import _ from 'lodash'
import { unflatten } from 'flat'
import update from 'react-addons-update'
import FeaturePicker from '../FeatureSelector/FeaturePicker'
import FormsyForm from 'appirio-tech-react-components/components/Formsy'
const Formsy = FormsyForm.Formsy
import XMarkIcon from  '../../../../assets/icons/icon-x-mark.svg'
import SpecSection from '../SpecSection'
import { HOC as hoc } from 'formsy-react'
import cn from 'classnames'
import {
  initWizard,
  removeValuesOfHiddenNodes,
  updateNodesByConditions,
  getVisibilityForRendering,
  STEP_VISIBILITY,
  STEP_STATE,
} from '../../../../helpers/wizardHelper'
import { clean } from '../../../../helpers/utils'

import './EditProjectForm.scss'
import { PROJECT_STATUS_COMPLETED, SCOPE_CHANGE_REQ_STATUS_ACTIVATED, SCOPE_CHANGE_REQ_STATUS_PENDING, SCOPE_CHANGE_REQ_STATUS_APPROVED } from '../../../../config/constants'

const FeaturePickerModal = ({ project, isEdittable, showFeaturesDialog, hideFeaturesDialog, saveFeatures, setValue }) => {
  const setFormValue = (features, featureSeeAttached=false) => {
    const featureObj = {
      value: features,
      seeAttached: featureSeeAttached
    }
    setValue(featureObj)
    saveFeatures(features, featureSeeAttached)
  }
  return (
    <Modal
      isOpen={ showFeaturesDialog }
      className="feature-selection-dialog"
      overlayClassName="feature-selection-dialog-overlay"
      onRequestClose={ hideFeaturesDialog }
      contentLabel=""
    >
      <FeaturePicker
        features={ _.get(project, 'details.appDefinition.features.value', []) }
        isEdittable={isEdittable} onSave={ setFormValue }
      />
      <div onClick={ hideFeaturesDialog } className="feature-selection-dialog-close">
        Save and close <XMarkIcon />
      </div>
    </Modal>
  )
}

const FeaturePickerFormField = hoc(FeaturePickerModal)

class EditProjectForm extends Component {

  constructor(props) {
    super(props)
    this.enableButton = this.enableButton.bind(this)
    this.disableButton = this.disableButton.bind(this)
    this.showFeaturesDialog = this.showFeaturesDialog.bind(this)
    this.hideFeaturesDialog = this.hideFeaturesDialog.bind(this)
    this.saveFeatures = this.saveFeatures.bind(this)
    this.onFeaturesSaveAttachedClick = this.onFeaturesSaveAttachedClick.bind(this)
    this.submit = this.submit.bind(this)
    this.onLeave = this.onLeave.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.makeDeliveredPhaseReadOnly = this.makeDeliveredPhaseReadOnly.bind(this)
    this.isScopeFreezed = this.isScopeFreezed.bind(this)

    // init wizard to support dependant questions
    const {
      template,
      hasDependantFields,
    } = initWizard(props.template, props.project, props.productTemplates, null)

    this.state = {
      template,
      hasDependantFields,
      dirtyProject: Object.assign({}, props.project),
      formsyFormKey: 0
    }
  }

  componentWillMount() {
    this.setState({
      isProjectDirty: false,
      isFeaturesDirty: false,
      project: Object.assign({}, this.props.project),
      canSubmit: false,
      showFeaturesDialog: false
    })
  }

  componentWillReceiveProps(nextProps) {
    let { template, hasDependantFields } = this.state
    // updating template from template editor
    if(nextProps.shouldUpdateTemplate && template !== nextProps.template) {

      const state = initWizard(nextProps.template, nextProps.project, nextProps.productTemplates, null)

      template = state.template
      hasDependantFields = state.hasDependantFields

      this.setState({
        template,
        hasDependantFields,
      })
    }

    // we received property updates from PROJECT_DIRTY REDUX state
    if (nextProps.project.isDirty) {
      this.setState({
        // sets a new state variable with dirty project
        // any component who wants to listen for unsaved changes in project form can listen to this state variable
        dirtyProject: Object.assign({}, nextProps.project),
        isProjectDirty: true
      })
    } else {
      let updatedProject = Object.assign({}, nextProps.project)
      if (this.state.isFeaturesDirty && !this.state.isSaving) {
        updatedProject = update(updatedProject, {
          details: {
            appDefinition: {
              features: {
                $set: this.state.project.details.appDefinition.features
              }
            }
          }
        })
      }

      // If a scope change is activated, future resets should revert to the new project state. 
      // There is no way to reinitialize formsyForm values with pristine flag.
      // So, remount formsy form with new initial values by updating the key prop on FormsyForm element.
      const formsyFormKey = this.isScopeChangeActivated(this.props.project, nextProps.project)
        ? this.state.formsyFormKey + 1 
        : this.state.formsyFormKey

      this.setState({
        project: updatedProject,
        isFeaturesDirty: false, // Since we just saved, features are not dirty anymore.
        isProjectDirty: false,
        canSubmit: false,
        isSaving: false,
        formsyFormKey
      })
    }

    if (hasDependantFields && !_.isEqual(this.props.project, nextProps.project)) {
      const {
        updatedTemplate,
        updatedSomeNodes,
        hidedSomeNodes
      } = updateNodesByConditions(template, nextProps.project, nextProps.productTemplates)

      if (updatedSomeNodes) {
        this.setState(state => ({
          template: updatedTemplate,
          project: hidedSomeNodes ? nextProps.project : state.project,
        }))

        // re-check again if any hidden values when an option is deselected
        const updatedProject = clean(removeValuesOfHiddenNodes(updatedTemplate, nextProps.project))
        const skipProperties = ['members', 'invites']
        const clearUpdatedProject = clean(_.omit(updatedProject, [...skipProperties, 'isDirty']))
        const clearUpdatedNonDirtyProject = clean(_.omit(nextProps.projectNonDirty, skipProperties))
        const isDirty = !_.isEqual(clearUpdatedProject, clearUpdatedNonDirtyProject)
        // update the state, always use this flag to check if changed
        this.setState({
          isProjectDirty: isDirty,
        })
      }
    }
  }

  isScopeChangeActivated(projectState, newProjectState) {
    const pendingStatuses = [SCOPE_CHANGE_REQ_STATUS_PENDING, SCOPE_CHANGE_REQ_STATUS_APPROVED]
    const pendingScopeChange = _.find(projectState.scopeChangeRequests, scr => pendingStatuses.indexOf(scr.status) !== -1)
    const updatedPendingScopeChange = pendingScopeChange && _.find(newProjectState.scopeChangeRequests, scr => scr.id === pendingScopeChange.id)

    return updatedPendingScopeChange && updatedPendingScopeChange.status === SCOPE_CHANGE_REQ_STATUS_ACTIVATED
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.onLeave)
  }

  componentDidUpdate() {
    this.refs.form && this.refs.form.inputs.forEach(q => {
      q.props.options && q.props.options.forEach((option) => {
        // select options if they are selected by condition
        if (_.get(option, '__wizard.selectedByCondition', false)) {
          const curValue = q.getValue()

          if (curValue.indexOf(option.value) === -1) {
            q.setValue(curValue.concat(option.value))
          }
        }
      })
    })
  }

  autoResize() {
    if (self.autoResizeSet === true) { return }
    self.autoResizeSet = true
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 1000)
  }

  componentWillUnmount() {
    this.props.fireProjectDirtyUndo()
    window.removeEventListener('beforeunload', this.onLeave)
  }

  // Notify user if they navigate away while the form is modified.
  onLeave(e = {}) {
    this.autoResize()
    if (this.isChanged()) {
      // TODO: remove this block - it disables unsaved changes popup
      // for app screens changes
      if (this.refs.form){
        const pristine = this.refs.form.getPristineValues()
        const current = this.refs.form.getCurrentValues()
        pristine['details.appScreens.screens']=current['details.appScreens.screens']
        if (_.isEqual(pristine, current)){
          return
        }
      }
      return e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    }
  }

  isChanged() {
    return !!this.state.isProjectDirty
  }

  enableButton() {
    this.setState( { canSubmit: true })
  }

  disableButton() {
    this.setState({ canSubmit: false })
  }

  showFeaturesDialog() {
    this.setState({ showFeaturesDialog : true})
  }

  hideFeaturesDialog() {
    this.setState({ showFeaturesDialog: false })
  }

  onFeaturesSaveAttachedClick() {
    this.saveFeatures([], true)
  }

  saveFeatures(features, featureSeeAttached=false) {
    if (!this.state.project.details.appDefinition) {
      this.state.project.details.appDefinition = { features: {} }
    }
    const featureObj = {
      value: features,
      seeAttached: featureSeeAttached
    }
    this.setState(update(this.state, {
      isFeaturesDirty: { $set: true },
      project: { details: { appDefinition: { features: { $set: featureObj } } } },
      canSubmit: { $set: true }
    }))
    // const details = update(this.state.project.details, { appDefinition: { features: { $set: obj }}})
    // this.props.submitHandler({ details })
  }

  isScopeFreezed() {
    return false
    // TODO commented to disable the scope change flow for immediate release
    // return [PROJECT_STATUS_DRAFT, PROJECT_STATUS_IN_REVIEW].indexOf(this.props.project.status) === -1
  }

  submit(model) {
    this.setState({isSaving: true })
    const modelWithoutHiddenValues = removeValuesOfHiddenNodes(this.state.template, model)
    const scopeFreezed = this.isScopeFreezed()
    this.props.submitHandler(modelWithoutHiddenValues, scopeFreezed)

    if (scopeFreezed) {
      this.refs.form.reset()
    }
  }

  /**
   * Handles the change event of the form.
   *
   * @param change changed form model in flattened form
   * @param isChanged flag that indicates if form actually changed from initial model values
   */
  handleChange(change) {
    this.props.fireProjectDirty(unflatten(change))
  }

  makeDeliveredPhaseReadOnly(projectStatus) {
    return projectStatus === PROJECT_STATUS_COMPLETED
  }

  render() {
    const {
      isEdittable,
      showHidden,
      productTemplates,
      productCategories,
      pendingScopeChange,
      isInsideDrawer,
      disableAutoScrolling,
      currentWizardStep,
    } = this.props
    const { template } = this.state
    const { project, dirtyProject } = this.state
    const onLeaveMessage = this.onLeave() || ''
    const renderSection = (section, idx) => {
      const anySectionInvalid = _.some(template.sections, (s) => s.isInvalid)
      return (
        <div
          key={section.id || `section-${idx}`}
          className={cn(
            'spec-section-container', {
              [`section-theme-${section.theme}`]: !!section.theme,
              [`section-state-${section.stepState}`]: !!section.stepState,
              [`section-visibility-${section.visibilityForRendering}`]: !!section.visibilityForRendering
            }
          )}
        >
          <SpecSection
            {...section}
            project={project}
            dirtyProject={dirtyProject}
            isProjectDirty={this.state.isProjectDirty}
            template={template}
            productTemplates={productTemplates}
            productCategories={productCategories}
            sectionNumber={idx + 1}
            resetFeatures={this.onFeaturesSaveAttachedClick}
            showFeaturesDialog={this.showFeaturesDialog}
            disableAutoScrolling={disableAutoScrolling}
            // TODO we shoudl not update the props (section is coming from props)
            validate={(isInvalid) => section.isInvalid = isInvalid}
            showHidden={showHidden}
            addAttachment={this.props.addAttachment}
            updateAttachment={this.props.updateAttachment}
            removeAttachment={this.props.removeAttachment}
            attachmentsStorePath={this.props.attachmentsStorePath}
            canManageAttachments={this.props.canManageAttachments}
            currentWizardStep={currentWizardStep}
          />
          <div className="section-footer section-footer-spec">
            { !pendingScopeChange &&
              <button className="tc-btn tc-btn-primary tc-btn-md"
                type="submit"
                disabled={(!this.isChanged() || this.state.isSaving) || anySectionInvalid || !this.state.canSubmit || this.makeDeliveredPhaseReadOnly(project.status)}
              >{ this.isScopeFreezed() ? 'Submit Change Request' : 'Save Changes'}</button>
            }
          </div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          'editProjectForm', {
            ['is-inside-drawer']: isInsideDrawer,
            [`form-theme-${template.theme}`]: template.theme
          }
        )}
      >
        <Prompt
          when={!!onLeaveMessage}
          message={onLeaveMessage}
        />
        <Formsy.Form
          key={this.state.formsyFormKey} // to force formsy to remount and reinitialize values
          ref="form"
          disabled={!isEdittable || this.makeDeliveredPhaseReadOnly(project.status)}
          onInvalid={this.disableButton}
          onValid={this.enableButton}
          onValidSubmit={this.submit}
          onChange={ this.handleChange }
        >
          {template.sections.map(section => ({
            ...section,
            visibilityForRendering: currentWizardStep ?
              // if define currentWizardStep, then use it to determine visibility of the setp
              getVisibilityForRendering(template, section, currentWizardStep) :
              // otherwise, in edit form we always show steps in read-optimized mode
              STEP_VISIBILITY.READ_OPTIMIZED,
            // in edit form we always treat steps as completed aka 'prev'
            stepState: STEP_STATE.PREV
          })).filter((section) => (
            // hide if we are in a wizard mode and section is hidden for now
            section.visibilityForRendering !== STEP_VISIBILITY.NONE &&
            // hide if section is hidden by condition
            (!_.get(section, '__wizard.hiddenByCondition')) &&
            // hide sections in edit mode, except we defined the particular step to show
            (!section.hiddenOnEdit || currentWizardStep)
          )).map(renderSection)}
          <FeaturePickerFormField
            name="details.appDefinition.features"
            project={ project }
            isEdittable={ isEdittable }
            showFeaturesDialog={ this.state.showFeaturesDialog }
            hideFeaturesDialog={ this.hideFeaturesDialog }
            saveFeatures={ this.saveFeatures }
            value={ _.get(project, 'details.appDefinition.features', {})}
          />
        </Formsy.Form>

      </div>
    )
  }
}

EditProjectForm.defaultProps = {
  shouldUpdateTemplate: false,
  onlyShowSummary: false,
  isInsideDrawer: false,
  disableAutoScrolling: false,
}

EditProjectForm.propTypes = {
  project: PropTypes.object.isRequired,
  saving: PropTypes.bool.isRequired,
  template: PropTypes.object.isRequired,
  productTemplates: PropTypes.array.isRequired,
  productCategories: PropTypes.array.isRequired,
  isEdittable: PropTypes.bool.isRequired,
  submitHandler: PropTypes.func.isRequired,
  fireProjectDirty: PropTypes.func.isRequired,
  fireProjectDirtyUndo: PropTypes.func.isRequired,
  showHidden: PropTypes.bool,
  addAttachment: PropTypes.func.isRequired,
  updateAttachment: PropTypes.func.isRequired,
  removeAttachment: PropTypes.func.isRequired,
  shouldUpdateTemplate: PropTypes.bool,
  isInsideDrawer: PropTypes.bool,
  disableAutoScrolling: PropTypes.bool,
  pendingScopeChange: PropTypes.object,
  /**
   * If `currentWizardStep` is defined, then edit form shows form in the wizard mode
   * with this step as current, instead of showing all the sections.
   * NOTE: when `currentWizardStep` is defined, the `hiddenOnEdit` are ignored for `sections`.
   */
  currentWizardStep: PropTypes.any,
}

export default EditProjectForm
