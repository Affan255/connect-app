import React from 'react'
import PT from 'prop-types'
import cn from 'classnames'

import IconX from '../../../../assets/icons/ui-16px-1_bold-remove.svg'
import IconAdd from '../../../../assets/icons/ui-16px-1_bold-add.svg'
import SkillsQuestion from '../SkillsQuestion/SkillsQuestionBase'
import PositiveNumberInput from '../../../../components/PositiveNumberInput/PositiveNumberInput'
import ProductTypeIcon from '../../../../components/ProductTypeIcon'

import styles from './TalentPickerRow.scss'

const always = () => true
const never = () => false
const emptyError = () => ''

class TalentPickerRow extends React.PureComponent {
  constructor(props) {
    super(props)

    this.handlePeopleChange = this.handlePeopleChange.bind(this)
    this.handleDurationChange = this.handleDurationChange.bind(this)
    this.handleSkillChange = this.handleSkillChange.bind(this)

    this.resetPeople = this.resetPeople.bind(this)
    this.resetDuration = this.resetDuration.bind(this)

    this.onAddRow = this.onAddRow.bind(this)
    this.onDeleteRow = this.onDeleteRow.bind(this)
  }

  handlePeopleChange(evt) {
    this.props.onChange(this.props.rowIndex, 'people', evt.target.value)
  }

  handleDurationChange(evt) {
    this.props.onChange(this.props.rowIndex, 'duration', evt.target.value)
  }

  handleSkillChange(value) {
    this.props.onChange(this.props.rowIndex, 'skills', value)
  }

  resetDuration() {
    const { rowIndex, onChange, value } = this.props
    if (!value.duration) {
      onChange(rowIndex, 'duration', '0')
    }
  }

  resetPeople() {
    const { rowIndex, onChange, value } = this.props
    if (!value.people) {
      onChange(rowIndex, 'people', '0')
    }
  }

  onAddRow() {
    const { rowIndex, value, onAddRow: addRowHandler } = this.props
    addRowHandler(rowIndex + 1, value.role)
  }

  onDeleteRow() {
    const { rowIndex, onDeleteRow: deleteRowHandler } = this.props
    deleteRowHandler(rowIndex)
  }

  render() {
    const { value, canBeDeleted, roleSetting, rowIndex } = this.props
    const isRowIncomplete = value.people > 0 || value.duration > 0 || (value.skills && value.skills.length)

    /* Different columns are defined here and used in componsing mobile/desktop views below */
    const roleColumn = (
      <div styleName="col col-role">
        <div styleName="col-role-container">
          <ProductTypeIcon type={roleSetting.icon} />
          <div styleName="role-text">{roleSetting.roleTitle}</div>
        </div>
      </div>
    )

    const actionsColumn = (
      <div styleName="col col-actions">
        <div styleName="d-flex col-actions-container">
          <div onClick={this.onAddRow} styleName="action-btn">
            <IconAdd />
          </div>
          {canBeDeleted(value.role, rowIndex) && (
            <div onClick={this.onDeleteRow} styleName="action-btn action-btn-remove">
              <IconX />
            </div>
          )}
        </div>
      </div>
    )

    const peopleColumn = (
      <div styleName="col col-people">
        <label className="tc-label" styleName="label">
          People
        </label>
        <PositiveNumberInput
          styleName="noMargin"
          className={cn('tc-file-field__inputs', { error: isRowIncomplete && value.people <= 0 })}
          max={10000}
          value={value.people || ''}
          onChange={this.handlePeopleChange}
          onBlur={this.resetPeople}
        />
      </div>
    )

    const durationColumn = (
      <div styleName="col col-duration">
        <label className="tc-label" styleName="label">
          Duration (months)
        </label>
        <PositiveNumberInput
          styleName="noMargin"
          className={cn('tc-file-field__inputs', {error: isRowIncomplete && value.duration <= 0 })}
          max={10000}
          value={value.duration || ''}
          onChange={this.handleDurationChange}
          onBlur={this.resetDuration}
        />
      </div>
    )

    const skillSelectionColumn = (
      <div styleName="col col-skill-selection">
        <label className="tc-label" styleName="label">
          Skills
        </label>
        {/*
          Please do not refactor getValue prop's value to a binded function with constant reference.
          SkillsQuestion is a pure component. If all the props are constant across renders, SkillsQuestion cannot detect the change in value.skills.
          So, it'll break the functionality of the component.
          "getValue" prop is left as inline arrow function to trigger re rendering of the SkillsQuestion component whenever the parent rerenders.
        */}
        <SkillsQuestion
          disabled={false}
          isFormDisabled={never}
          skillsCategories={roleSetting.skillsCategories}
          isPristine={always}
          isValid={always}
          getErrorMessage={emptyError}
          setValue={this.handleSkillChange}
          getValue={() => value.skills}
          onChange={_.noop}
          selectWrapperClass={cn(styles.noMargin, {[styles.skillHasError]: isRowIncomplete && !(value.skills && value.skills.length)})}
        />
      </div>
    )

    return (
      <div styleName="row">
        <div styleName="inner-row">
          {roleColumn}
          {actionsColumn}
        </div>

        <div styleName="inner-row">
          {peopleColumn}
          {durationColumn}
        </div>

        <div styleName="inner-row">{skillSelectionColumn}</div>
      </div>
    )
  }
}

TalentPickerRow.propTypes = {
  rowIndex: PT.number.isRequired,
  canBeDeleted: PT.func.isRequired,
  onChange: PT.func.isRequired,
  onAddRow: PT.func.isRequired,
  onDeleteRow: PT.func.isRequired,
  roleSetting: PT.shape({
    roleTitle: PT.string.isRequired,
    skillsCategories: PT.arrayOf(PT.string),
  }).isRequired,
  value: PT.shape({
    role: PT.string.isRequired,
    people: PT.string.isRequired,
    duration: PT.string.isRequired,
    skills: PT.array,
  }),
}

TalentPickerRow.defaultProps = {}

export default TalentPickerRow
