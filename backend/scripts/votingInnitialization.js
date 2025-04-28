
// Run once to create initial settings
const initializeElectionSettings = async () => {
    const exists = await ElectionSettings.findOne()
    if (!exists) {
      await ElectionSettings.create({})
    }
  }
  initializeElectionSettings()