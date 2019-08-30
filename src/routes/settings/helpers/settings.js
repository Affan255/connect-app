/**
 * Setting related helper methods
 */
import _ from 'lodash'

// blank traits object which we can use if trait doesn't exist to create a new one
export const blankTraits = {
  'connect_info': { // eslint-disable-line quote-props
    traitId: 'connect_info',
    categoryName: 'Connect User Information',
    traits: {
      data: [{}],
    },
  },
  'basic_info': { // eslint-disable-line quote-props
    traitId: 'basic_info',
    categoryName: 'Basic Info',
    traits: {
      data: [{}],
    },
  },
  // to use for fallback on PROD for now
  'customer_info': { // eslint-disable-line quote-props
    traitId: 'customer_info',
    categoryName: 'Customer Information',
    traits: {
      data: [{}],
    },
  },
}

// as now both DEV and PROD environments support `connect_info` trait we always use it
export const customerTraitId = 'connect_info'

/**
 * Format row member traits data to the format which can be rendered by the form
 * on profile settings page.
 *
 * @param {Array<Object>} traits list of member traits
 *
 * @returns {Object} data formated for profile settings page form
 */
export const formatProfileSettings = (traits) => {
  // TODO Revert to 'connect_info' again when PROD supports it
  const connectTrait = _.find(traits, ['traitId', customerTraitId])
  let data = {}

  if (connectTrait) {
    const traitData = _.get(connectTrait, 'traits.data')
    if (traitData && traitData.length > 0) {
      data = traitData[0]
    }
  }

  const basicTrait = _.find(traits, ['traitId', 'basic_info'])
  if (basicTrait) {
    const traitData = _.get(basicTrait, 'traits.data')
    if (traitData && traitData.length > 0) {
      _.assign(data, _.pick(traitData[0], 'firstName', 'lastName'))
      data.photoUrl = traitData[0].photoURL
    }
  }

  return data
}

/**
 * Applies profile settings from the form to row member traits data.
 * This method doesn't mutate traits.
 *
 * @param {Array<Object>} traits   list of member traits
 * @param {Object} profileSettings profile settings
 *
 * @returns {Array<Object>} updated member traits data
 */
export const applyProfileSettingsToTraits = (traits, profileSettings) => {
  const existentTraits = [...traits]

  //  make sure traits exists so we can update them
  if (!_.find(existentTraits, { traitId: 'basic_info'})) {
    existentTraits.push(blankTraits['basic_info'])
  }
  if (!_.find(existentTraits, { traitId: customerTraitId})) {
    existentTraits.push(blankTraits[customerTraitId])
  }

  const updatedTraits = existentTraits.map((trait) => {
    // we put all the info from profile settings to `connect_info` trait as it is, skipping `photoUrl`
    // TODO Revert to 'connect_info' again when PROD supports it
    if (trait.traitId === customerTraitId) {
      const updatedTrait = {...trait}
      const updatedProps = _.omit(profileSettings, ['photoUrl', 'firstName', 'lastName'])
      const existingProps = _.omit(_.get(trait, 'traits.data[0]'), ['firstName', 'lastName'])
      const { firstName, lastName } = profileSettings

      updatedTrait.traits = {
        ...trait.traits,
        data: [{
          ...existingProps,
          ...updatedProps,
          firstNLastName: `${firstName} ${lastName}`
        }]
      }

      // define categoryName to handle possible data inconsistency
      if (!updatedTrait.categoryName) {
        updatedTrait.categoryName = blankTraits[customerTraitId].categoryName
      }

      return updatedTrait
    }

    // to the `basic_info` we put just photoUrl, firstName and lastName
    if (trait.traitId === 'basic_info') {
      const updatedTrait = {...trait}
      const { photoUrl: photoURL, firstName, lastName } = profileSettings

      // define country similar to connect_info if not present for basic_info
      const country = _.get(trait, 'traits.data[0].country', profileSettings.country)

      // update only if new values are defined
      const updatedProps = _.omitBy({
        photoURL,
        firstName,
        lastName,
        country,
      }, _.isUndefined)

      updatedTrait.traits = {
        ...trait.traits,
        data: [{
          ..._.get(trait, 'traits.data[0]'),
          ...updatedProps
        }]
      }

      // define categoryName to handle possible data inconsistency
      if (!updatedTrait.categoryName) {
        updatedTrait.categoryName = blankTraits['basic_info'].categoryName
      }

      return updatedTrait
    }

    return trait
  })

  return updatedTraits
}